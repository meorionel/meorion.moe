/**
 * 心率数据类型（浏览器 / 服务端共用）。
 *
 * 浏览器只会从同源的 `/api/heart` 拿到这一份数据；LitterLove 的地址、
 * 设备信息、电量、定位等内容都留在服务端，不会出现在接口响应里。
 */

export const HEART_RATE_STATUSES = ["live", "stale", "offline", "waiting"] as const;

export type HeartRateStatus = (typeof HEART_RATE_STATUSES)[number];

export type HeartRate = {
    /** 最近一次心率；没有数据时为 null */
    bpm: number | null;
    /** 数据新鲜度：live / stale / offline / waiting */
    status: HeartRateStatus;
};

export const WAITING_HEART_RATE: HeartRate = {bpm: null, status: "waiting"};

export function isHeartRateStatus(value: unknown): value is HeartRateStatus {
    return typeof value === "string" && (HEART_RATE_STATUSES as readonly string[]).includes(value);
}
