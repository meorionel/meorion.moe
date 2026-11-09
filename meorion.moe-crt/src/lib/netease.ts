/**
 * 网易云歌曲解析。
 *
 * 后端用的是 Netease_url（https://github.com/Suxiaoqinx/Netease_url）的
 * `/song?id=...&type=json` 接口：一次返回歌曲名、歌手、专辑、封面和播放地址。
 * 该服务默认跑在 http://127.0.0.1:5000，部署到线上时用 VITE_NETEASE_API 指向自己的实例。
 */

export type Track = {
    id: string;
    name: string;
    artist: string;
    album: string;
    /** 专辑封面（已统一成 https） */
    cover: string;
    /** 音频地址（带时效签名，只在本次会话使用） */
    audio: string;
};

export type PlayerStatus = "idle" | "loading" | "ready" | "error";

const DEFAULT_API = "http://127.0.0.1:5000";

export const API_BASE =
    (((import.meta.env.VITE_NETEASE_API as string | undefined) ?? "").trim().replace(/\/+$/, "") ||
        DEFAULT_API);

/** 支持纯数字 ID、`https://music.163.com/song?id=123`、`.../#/song?id=123` */
export function extractSongId(input: string): string | null {
    const value = input.trim();
    if (!value) return null;
    if (/^\d+$/.test(value)) return value;
    const match = value.match(/[?&#]id=(\d+)/) ?? value.match(/\/song\/(\d+)/);
    return match?.[1] ?? null;
}

const toHttps = (url: string) => url.replace(/^http:\/\//i, "https://");

type SongResponse = {
    success?: boolean;
    message?: string;
    data?: {
        id?: string | number;
        name?: string;
        ar_name?: string;
        al_name?: string;
        pic?: string;
        url?: string | null;
    };
};

export async function fetchTrack(songId: string): Promise<Track> {
    const endpoint = `${API_BASE}/song?id=${encodeURIComponent(songId)}&type=json&level=standard`;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
        response = await fetch(endpoint, {
            signal: controller.signal,
            headers: {Accept: "application/json"},
        });
    } catch {
        throw new Error(
            controller.signal.aborted
                ? "解析超时，请重试"
                : `无法连接解析服务 ${API_BASE}，请先启动 Netease_url`,
        );
    } finally {
        window.clearTimeout(timer);
    }

    if (!response.ok) throw new Error(`解析服务返回 ${response.status}`);

    const body = (await response.json()) as SongResponse;
    if (body.success === false) throw new Error(body.message || "解析失败");

    const data = body.data;
    if (!data) throw new Error("解析服务没有返回歌曲信息");
    if (!data.url) throw new Error("没有拿到播放地址，可能受版权 / 会员限制");

    return {
        id: String(data.id ?? songId),
        name: data.name || "未知歌曲",
        artist: data.ar_name || "",
        album: data.al_name || "",
        cover: data.pic ? toHttps(data.pic) : "",
        audio: toHttps(data.url),
    };
}
