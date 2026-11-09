import { createCipheriv, createHash } from "node:crypto";

/**
 * 网易云歌曲解析（服务端）。
 *
 * 复刻自 Netease_url 的 `/song?type=json` 逻辑：
 *   1. `/api/v3/song/detail` 取歌名 / 歌手 / 专辑 / 封面
 *   2. eapi `/eapi/song/enhance/player/url/v1` 取带时效签名的播放地址
 *
 * eapi 的参数需要 AES-128-ECB 加密，并在明文里带 MD5 摘要；
 * Cookie 只从这里读取，不会返回给浏览器。
 */

const EAPI_URL = "https://interface3.music.163.com/eapi/song/enhance/player/url/v1";
const DETAIL_URL = "https://interface3.music.163.com/api/v3/song/detail";
const LEGACY_DETAIL_URL = "https://music.163.com/api/song/detail/";
const AES_KEY = "e82ckenh8dichen8";
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/2.10.2.200154";
const REFERER = "https://music.163.com/";
const TIMEOUT_MS = 20_000;

const DEFAULT_COOKIES: Record<string, string> = {
    os: "pc",
    appver: "",
    osver: "",
    deviceId: "pyncm!",
};

export class NeteaseError extends Error {
    status: number;

    constructor(message: string, status = 502) {
        super(message);
        this.name = "NeteaseError";
        this.status = status;
    }
}

export type ResolvedTrack = {
    id: string;
    name: string;
    ar_name: string;
    al_name: string;
    pic: string;
    url: string;
    level: string;
    size: number;
};

type Json = Record<string, unknown>;

const toHttps = (url: string) => url.replace(/^http:\/\//i, "https://");

const stripQuotes = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length >= 2) {
        const first = trimmed[0];
        const last = trimmed[trimmed.length - 1];
        if ((first === '"' || first === "'") && first === last) return trimmed.slice(1, -1).trim();
    }
    return trimmed;
};

function parseCookieString(raw: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    for (const pair of raw.split(/[;\n]/)) {
        const item = pair.trim();
        if (!item || !item.includes("=")) continue;
        const index = item.indexOf("=");
        const key = item.slice(0, index).trim();
        const value = item.slice(index + 1).trim();
        if (key) cookies[key] = value;
    }
    return cookies;
}

/** 环境变量里的 cookie；支持完整 `k=v; k=v` 或只写一个 MUSIC_U token */
function getEnvCookie(): Record<string, string> | null {
    const raw = process.env.NETEASE_COOKIE;
    if (raw?.trim()) {
        const value = stripQuotes(raw);
        return value.includes("=") ? parseCookieString(value) : {MUSIC_U: value};
    }

    const musicU = process.env.MUSIC_U;
    if (musicU?.trim()) {
        return {MUSIC_U: stripQuotes(musicU)};
    }

    return null;
}

function buildCookieHeader(cookies: Record<string, string>): string {
    const merged = {...DEFAULT_COOKIES, ...cookies};
    return Object.entries(merged)
        .filter(([key]) => Boolean(key))
        .map(([key, value]) => `${key}=${value}`)
        .join("; ");
}

function md5Hex(input: string): string {
    return createHash("md5").update(input, "utf8").digest("hex");
}

function encryptEapi(url: string, payload: unknown): string {
    const path = new URL(url).pathname.replace("/eapi/", "/api/");
    const text = JSON.stringify(payload);
    const digest = md5Hex(`nobody${path}use${text}md5forencrypt`);
    const raw = `${path}-36cd479b6b5-${text}-36cd479b6b5-${digest}`;

    const cipher = createCipheriv("aes-128-ecb", Buffer.from(AES_KEY, "utf8"), null);
    const encrypted = Buffer.concat([cipher.update(raw, "utf8"), cipher.final()]);
    return encrypted.toString("hex");
}

async function fetchJson(url: string, init: RequestInit, signal: AbortSignal): Promise<Json> {
    const response = await fetch(url, {...init, signal, cache: "no-store"});
    if (!response.ok) {
        throw new NeteaseError(`网易云接口返回 ${response.status}`, 502);
    }
    try {
        return (await response.json()) as Json;
    } catch {
        throw new NeteaseError("网易云接口返回了无法解析的数据", 502);
    }
}

function baseHeaders(cookie?: string): Record<string, string> {
    const headers: Record<string, string> = {
        "User-Agent": USER_AGENT,
        Referer: REFERER,
    };
    if (cookie) headers.Cookie = cookie;
    return headers;
}

async function getSongUrl(
    id: string,
    cookie: string,
    hasUserCookie: boolean,
    signal: AbortSignal,
): Promise<{url: string; level: string; size: number}> {
    const payload = {
        ids: [Number(id)],
        level: "standard",
        encodeType: "flac",
        header: JSON.stringify({
            os: "pc",
            appver: "",
            osver: "",
            deviceId: "pyncm!",
            requestId: String(Math.floor(20_000_000 + Math.random() * 10_000_000)),
        }),
    };

    const params = encryptEapi(EAPI_URL, payload);
    const json = await fetchJson(
        EAPI_URL,
        {
            method: "POST",
            headers: {
                ...baseHeaders(cookie),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({params}).toString(),
        },
        signal,
    );

    if (json.code !== 200) {
        const message = typeof json.message === "string" ? json.message : `错误码 ${String(json.code)}`;
        throw new NeteaseError(`获取播放地址失败：${message}`, 502);
    }

    const first = Array.isArray(json.data) ? (json.data[0] as Json | undefined) : undefined;
    if (!first || typeof first.url !== "string" || !first.url) {
        throw new NeteaseError(
            hasUserCookie
                ? "没有拿到播放地址，可能受版权 / 会员限制，或 Cookie 已失效"
                : "没有拿到播放地址；请在 .env.local 配置 NETEASE_COOKIE（或 MUSIC_U）后重试",
            404,
        );
    }

    return {
        url: toHttps(first.url),
        level: typeof first.level === "string" ? first.level : "standard",
        size: typeof first.size === "number" ? first.size : 0,
    };
}

async function getV3Detail(id: string, signal: AbortSignal): Promise<Json> {
    const json = await fetchJson(
        DETAIL_URL,
        {
            method: "POST",
            headers: {
                ...baseHeaders(),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                c: JSON.stringify([{id: Number(id), v: 0}]),
            }).toString(),
        },
        signal,
    );

    if (json.code !== 200) {
        const message = typeof json.message === "string" ? json.message : `错误码 ${String(json.code)}`;
        throw new NeteaseError(`获取歌曲信息失败：${message}`, 502);
    }

    const song = Array.isArray(json.songs) ? (json.songs[0] as Json | undefined) : undefined;
    if (!song) throw new NeteaseError("没有找到这首歌", 404);
    return song;
}

/** 某些歌曲 / 地区下 v3 详情会失败，退化到旧的公开详情接口 */
async function getLegacyDetail(id: string, signal: AbortSignal): Promise<Json> {
    const url = `${LEGACY_DETAIL_URL}?id=${encodeURIComponent(id)}&ids=${encodeURIComponent(`[${id}]`)}`;
    const json = await fetchJson(url, {headers: baseHeaders()}, signal);
    const song = Array.isArray(json.songs) ? (json.songs[0] as Json | undefined) : undefined;
    if (!song) throw new NeteaseError("没有找到这首歌", 404);
    return song;
}

async function getDetail(id: string, signal: AbortSignal): Promise<Json> {
    try {
        return await getV3Detail(id, signal);
    } catch (error) {
        if (signal.aborted) throw error;
        return getLegacyDetail(id, signal);
    }
}

function normalizeDetail(song: Json, id: string) {
    const artists = Array.isArray(song.ar)
        ? song.ar
        : Array.isArray(song.artists)
          ? song.artists
          : [];
    const album = (song.al ?? song.album ?? {}) as Json;

    const artistNames = artists
        .map((artist) => {
            if (!artist || typeof artist !== "object") return "";
            const name = (artist as Json).name;
            return typeof name === "string" ? name : "";
        })
        .filter(Boolean);

    return {
        id,
        name: typeof song.name === "string" && song.name ? song.name : "未知歌曲",
        ar_name: artistNames.join(", "),
        al_name: typeof album.name === "string" ? album.name : "",
        pic: typeof album.picUrl === "string" && album.picUrl ? toHttps(album.picUrl) : "",
    };
}

export async function resolveTrack(id: string): Promise<ResolvedTrack> {
    const envCookies = getEnvCookie();
    const cookie = buildCookieHeader(envCookies ?? {});

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const [song, audio] = await Promise.all([
            getDetail(id, controller.signal),
            getSongUrl(id, cookie, envCookies !== null, controller.signal),
        ]);

        return {
            ...normalizeDetail(song, id),
            url: audio.url,
            level: audio.level,
            size: audio.size,
        };
    } catch (error) {
        if (error instanceof NeteaseError) throw error;
        if (controller.signal.aborted) {
            throw new NeteaseError("请求网易云超时，请重试", 504);
        }
        throw new NeteaseError("解析网易云歌曲失败，请稍后重试", 502);
    } finally {
        clearTimeout(timer);
    }
}
