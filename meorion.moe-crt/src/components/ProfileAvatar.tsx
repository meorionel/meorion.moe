import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { extractAccentFromImage } from "../lib/accent";
import styles from "./SiteCard.module.css";

type Props = {
    src: string;
    alt: string;
    /** 头像右下角状态点的颜色类，由心率连接状态决定 */
    tone: string;
};

export default function ProfileAvatar({src, alt, tone}: Props) {
    // 柔光的颜色只取自头像本身，不跟页面主题色走
    const [glow, setGlow] = useState<string | null>(null);

    useEffect(() => {
        setGlow(null);
        let cancelled = false;
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.decoding = "async";

        const onLoad = () => {
            if (cancelled) return;
            setGlow(extractAccentFromImage(image));
        };
        const onError = () => {
            if (!cancelled) setGlow(null);
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

    const glowStyle = glow ? ({"--avatar-glow": glow} as CSSProperties) : undefined;

    return (
        <div
            className={`relative flex-none rounded-full max-md:order-first ${styles.avatarHalo}`}
            style={glowStyle}
        >
            <div className="relative size-[60px] border-b border-accent/35">
                <span className={`absolute inset-0 ${styles.avatarCrop}`}>
                    <img
                        src={src}
                        alt={alt}
                        draggable={false}
                        className={`absolute left-1/2 top-[-10%] w-[110%] max-w-none -translate-x-1/2 ${styles.avatarImage}`}
                    />
                </span>
            </div>
            <span
                className={`absolute -right-[3px] -bottom-[3px] size-[10px] rounded-full border-2 border-[#0a0c08] bg-current ${tone} ${styles.statusDot}`}
                aria-hidden="true"
            />
        </div>
    );
}
