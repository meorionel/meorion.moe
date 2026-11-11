import { useEffect, useState } from "react";

import { extractAccentFromImage, FALLBACK_ACCENT } from "../lib/accent";

/**
 * 从当前背景图里提取强调色，图片换掉（logo → 专辑封面 / 切歌）时自动重新提取。
 * 提取过程中保留上一次的颜色，不会闪回兜底色。
 */
export function useAccentColor(src: string | null | undefined): string {
    const [accent, setAccent] = useState(FALLBACK_ACCENT);

    useEffect(() => {
        if (!src) return;
        let cancelled = false;

        const image = new Image();
        // 远程封面需要 CORS 才能读像素；同源图片加 anonymous 也没有副作用
        image.crossOrigin = "anonymous";
        image.decoding = "async";

        const onLoad = () => {
            if (cancelled) return;
            const next = extractAccentFromImage(image);
            if (next) setAccent(next);
        };
        const onError = () => {
            /* 加载失败就保留当前颜色 */
        };

        image.addEventListener("load", onLoad);
        image.addEventListener("error", onError);
        image.src = src;

        return () => {
            cancelled = true;
            image.removeEventListener("load", onLoad);
            image.removeEventListener("error", onError);
        };
    }, [src]);

    return accent;
}
