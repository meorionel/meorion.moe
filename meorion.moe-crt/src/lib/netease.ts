/**
 * 网易云歌曲 / 歌单解析（浏览器侧）。
 *
 * 实际请求在 Next 的服务端路由里完成：
 *   - /api/song?id=...   歌曲信息 + 播放地址
 *   - /api/playlist      写死的歌单 719039399
 * Cookie 只在服务端读取，不会出现在浏览器里。
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

export type PlaylistTrack = {
    id: string;
    name: string;
    artist: string;
    album: string;
    cover: string;
    /** 秒 */
    duration: number;
};

export type Playlist = {
    id: string;
    name: string;
    cover: string;
    count: number;
    tracks: PlaylistTrack[];
};

export type PlayerStatus = "idle" | "loading" | "ready" | "error";
export type PlaylistStatus = "idle" | "loading" | "ready" | "error";

/** 支持纯数字 ID、`https://music.163.com/song?id=123`、`.../#/song?id=123` */
export function extractSongId(input: string): string | null {
    const value = input.trim();
    if (!value) return null;
    if (/^\d+$/.test(value)) return value;
    const match = value.match(/[?&#]id=(\d+)/) ?? value.match(/\/song\/(\d+)/);
    return match?.[1] ?? null;
}

const toHttps = (url: string) => url.replace(/^http:\/\//i, "https://");

type ApiBody<T> = {
    success?: boolean;
    message?: string;
    data?: T;
};

async function requestApi<T>(url: string, timeoutMs = 15000): Promise<T> {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
        response = await fetch(url, {
            signal: controller.signal,
            headers: {Accept: "application/json"},
        });
    } catch {
        throw new Error(
            controller.signal.aborted
                ? "请求超时，请重试"
                : "无法连接歌曲解析接口，请稍后重试",
        );
    } finally {
        window.clearTimeout(timer);
    }

    let body: ApiBody<T>;
    try {
        body = (await response.json()) as ApiBody<T>;
    } catch {
        throw new Error("解析接口返回了无法解析的数据");
    }

    if (!response.ok || body.success === false) {
        throw new Error(body.message || `请求失败（${response.status}）`);
    }

    if (!body.data) throw new Error("解析接口没有返回数据");
    return body.data;
}

type SongData = {
    id?: string | number;
    name?: string;
    ar_name?: string;
    al_name?: string;
    pic?: string;
    url?: string | null;
};

export async function fetchTrack(songId: string): Promise<Track> {
    const data = await requestApi<SongData>(`/api/song?id=${encodeURIComponent(songId)}`);

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

export async function fetchPlaylist(): Promise<Playlist> {
    const data = await requestApi<Playlist>("/api/playlist", 25000);
    if (!Array.isArray(data.tracks)) {
        throw new Error("歌单数据格式不正确");
    }
    return data;
}
