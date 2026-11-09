/**
 * 网易云歌曲解析（浏览器侧）。
 *
 * 实际解析在 Next 的 `/api/song` 服务端路由里完成：服务端读取 .env.local 的
 * NETEASE_COOKIE，调用网易云接口拿到歌曲信息 / 专辑封面 / 播放地址，
 * cookie 不会出现在浏览器里。
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
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
        response = await fetch(`/api/song?id=${encodeURIComponent(songId)}`, {
            signal: controller.signal,
            headers: {Accept: "application/json"},
        });
    } catch {
        throw new Error(
            controller.signal.aborted
                ? "解析超时，请重试"
                : "无法连接歌曲解析接口，请稍后重试",
        );
    } finally {
        window.clearTimeout(timer);
    }

    let body: SongResponse;
    try {
        body = (await response.json()) as SongResponse;
    } catch {
        throw new Error("解析接口返回了无法解析的数据");
    }

    if (!response.ok || body.success === false) {
        throw new Error(body.message || `解析失败（${response.status}）`);
    }

    const data = body.data;
    if (!data) throw new Error("解析接口没有返回歌曲信息");
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
