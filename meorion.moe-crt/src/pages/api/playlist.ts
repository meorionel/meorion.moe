import type { NextApiRequest, NextApiResponse } from "next";

import { NeteaseError, resolvePlaylist } from "@/server/netease";

/**
 * GET /api/playlist
 *
 * 歌单 ID 由服务端环境变量 PLAYLIST_ID 配置；返回歌单信息和歌曲列表。
 * 播放地址仍然按需走 /api/song，避免一次请求拿到一堆会过期的 URL。
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({success: false, message: "只支持 GET 请求"});
    }

    try {
        const playlist = await resolvePlaylist();
        return res.status(200).json({success: true, data: playlist});
    } catch (error) {
        const status = error instanceof NeteaseError ? error.status : 500;
        const message = error instanceof Error ? error.message : "载入歌单失败";
        return res.status(status).json({success: false, message});
    }
}
