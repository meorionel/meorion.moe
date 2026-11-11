import { useEffect, useState } from "react";

import { isHeartRateStatus, WAITING_HEART_RATE, type HeartRate, type HeartRateStatus } from "@/lib/heart";

const POLL_INTERVAL_MS = 30_000;

type HeartApiBody = {
    success?: boolean;
    data?: {
        bpm?: unknown;
        status?: unknown;
    };
};

/**
 * 轮询同源的 /api/heart。
 *
 * 浏览器从头到尾只认识 `/api/heart`，LitterLove 的连接和地址都在服务端；
 * 页签隐藏时暂停请求，回到前台立刻补一次。
 */
export function useHeartRate(intervalMs = POLL_INTERVAL_MS): HeartRate {
    const [heartRate, setHeartRate] = useState<HeartRate>(WAITING_HEART_RATE);

    useEffect(() => {
        let disposed = false;

        const load = async () => {
            try {
                const response = await fetch("/api/heart", {cache: "no-store"});
                const body = (await response.json().catch(() => null)) as HeartApiBody | null;
                const data = body?.data;

                if (!response.ok || !body?.success || !data) {
                    throw new Error("heart request failed");
                }

                if (disposed) return;

                const status: HeartRateStatus = isHeartRateStatus(data.status) ? data.status : "offline";
                const bpm = typeof data.bpm === "number" && Number.isFinite(data.bpm) ? Math.round(data.bpm) : null;
                setHeartRate({bpm, status});
            } catch {
                if (!disposed) setHeartRate({bpm: null, status: "offline"});
            }
        };

        void load();

        const timer = window.setInterval(() => {
            if (!document.hidden) void load();
        }, intervalMs);

        const onVisibilityChange = () => {
            if (!document.hidden) void load();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            disposed = true;
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [intervalMs]);

    return heartRate;
}
