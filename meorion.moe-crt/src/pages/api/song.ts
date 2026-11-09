import type { NextApiRequest, NextApiResponse } from "next";

import { NeteaseError, resolveTrack } from "@/server/netease";

/**
 * GET /api/song?id=185668
 *
 * 服务端解析歌曲信息 + 播放地址；Cookie 只在服务端使用。
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({success: false, message: "只支持 GET 请求"});
    }

    const raw = req.query.id;
    const id = Array.isArray(raw) ? raw[0] : raw;

    if (!id || !/^\d{1,20}$/.test(id) || !Number.isSafeInteger(Number(id))) {
        return res.status(400).json({success: false, message: "请输入正确的歌曲 ID"});
    }

    try {
        const track = await resolveTrack(id);
        return res.status(200).json({success: true, data: track});
    } catch (error) {
        const status = error instanceof NeteaseError ? error.status : 500;
        const message = error instanceof Error ? error.message : "解析失败";
        return res.status(status).json({success: false, message});
    }
}
