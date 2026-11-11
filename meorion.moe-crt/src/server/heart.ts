import type { HeartRate } from "@/lib/heart";
import { isHeartRateStatus } from "@/lib/heart";

/**
 * 从 LitterLove-server 读取心率（只在 Next 服务端执行）。
 *
 * 地址来自服务端环境变量 `LITTERLOVE_URL`，不会以 NEXT_PUBLIC_ 前缀暴露；
 * 这里也只挑出 `heartRate` 的 bpm / status，其他字段一概不返回。
 */

const TIMEOUT_MS = 5000;
const MIN_BPM = 20;
const MAX_BPM = 250;

type UpstreamState = {
    heartRate?: {
        bpm?: unknown;
        status?: unknown;
    };
};

export class HeartRateError extends Error {
    status: number;

    constructor(message: string, status = 502) {
        super(message);
        this.name = "HeartRateError";
        this.status = status;
    }
}

/** 把 LITTERLOVE_URL 拼成 `.../api/state`，同时校验协议，避免把奇怪的值塞进 fetch */
function resolveEndpoint(): URL {
    const base = process.env.LITTERLOVE_URL?.trim();
    if (!base) {
        throw new HeartRateError("未配置 LITTERLOVE_URL，请在 .env.local 里填写 LitterLove 服务地址", 500);
    }

    let url: URL;
    try {
        url = new URL(base);
    } catch {
        throw new HeartRateError("LITTERLOVE_URL 不是合法的地址", 500);
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new HeartRateError("LITTERLOVE_URL 只支持 http(s)", 500);
    }

    if (!url.pathname.endsWith("/")) url.pathname += "/";
    return new URL("api/state", url);
}

function toBpm(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    const bpm = Math.round(value);
    return bpm >= MIN_BPM && bpm <= MAX_BPM ? bpm : null;
}

/** 请求 LitterLove 的 /api/state，只留下心率；任何上游细节都不会进返回值 */
export async function fetchHeartRate(): Promise<HeartRate> {
    const endpoint = resolveEndpoint();

    let response: Response;
    try {
        response = await fetch(endpoint, {
            headers: {Accept: "application/json"},
            cache: "no-store",
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (error) {
        const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
        throw new HeartRateError(timedOut ? "心率服务响应超时" : "连接心率服务失败");
    }

    if (!response.ok) {
        throw new HeartRateError("心率服务暂时不可用");
    }

    let body: UpstreamState | null;
    try {
        body = (await response.json()) as UpstreamState;
    } catch {
        throw new HeartRateError("心率服务返回了无法解析的数据");
    }

    const heart = body?.heartRate;
    return {
        bpm: toBpm(heart?.bpm),
        status: isHeartRateStatus(heart?.status) ? heart.status : "offline",
    };
}
