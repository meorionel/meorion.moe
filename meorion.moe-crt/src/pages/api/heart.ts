import type { NextApiRequest, NextApiResponse } from "next";

import { fetchHeartRate, HeartRateError } from "@/server/heart";

/**
 * GET /api/heart
 *
 * 服务端去 LitterLove-server 取当前心率，浏览器只拿到 `{ bpm, status }`。
 * LitterLove 的地址只存在于服务端环境变量 LITTERLOVE_URL 里，不会下发到客户端。
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({success: false, message: "只支持 GET 请求"});
    }

    try {
        const heartRate = await fetchHeartRate();
        return res.status(200).json({success: true, data: heartRate});
    } catch (error) {
        if (error instanceof HeartRateError) {
            // 只回泛化的错误文案，不把 LitterLove 地址 / 上游响应带出去
            return res.status(error.status).json({success: false, message: error.message});
        }

        console.error("[heart] 读取心率失败", error);
        return res.status(502).json({success: false, message: "心率暂时获取不到"});
    }
}
