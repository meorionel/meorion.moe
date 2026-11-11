import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./BootScreen.module.css";

type Props = {
    /** 首屏数据、字体、背景图和 GSAP 都准备好后才开始收启动页 */
    ready: boolean;
    /** 进度条压缩动画结束后，通知页面切换到入场动画 */
    onDone: () => void;
};

/**
 * 服务端直接渲染的启动页：
 *   小尺寸 logo + 无限循环的进度条 + 终端感状态行。
 *
 * 不依赖 JS 就能显示，所以低速网络下不会先看到半成品页面；
 * 数据 / 背景图 / 字体 / GSAP 都就绪后，进度条向中间压缩，再交给 IntroOverlay。
 * 无 JS 时由 _document 的 noscript 样式直接隐藏；脚本完全加载失败时 35 秒后兜底淡出。
 */
export default function BootScreen({ready, onDone}: Props) {
    const doneRef = useRef(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!ready) return;

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // 先让 READY 状态和满格进度条停一下，再做压缩，不然「加载完成」只闪一帧
        const pause = reduce ? 0 : 180;
        const exitDuration = reduce ? 90 : 560;

        const start = window.setTimeout(() => setExiting(true), pause);
        const finish = window.setTimeout(() => {
            if (doneRef.current) return;
            doneRef.current = true;
            onDone();
        }, pause + exitDuration);

        return () => {
            window.clearTimeout(start);
            window.clearTimeout(finish);
        };
    }, [ready, onDone]);

    return (
        <div
            className={styles.screen}
            data-boot-screen=""
            data-state={exiting ? "done" : ready ? "ready" : "loading"}
            role="status"
            aria-live="polite"
            aria-label={ready ? "页面加载完成" : "页面加载中"}
        >
            <div className={styles.inner}>
                <div className={styles.logoFrame} aria-hidden="true">
                    <div className={styles.logoGlow}/>
                    <Image
                        className={styles.logo}
                        src="/media/logo.png"
                        alt=""
                        width={112}
                        height={112}
                        sizes="112px"
                        priority
                        draggable={false}
                    />
                    <span className={styles.logoScan}/>
                </div>

                <p className={styles.wordmark}>MEORION.MOE</p>
                <p className={styles.status}>
                    <span className={styles.dot} aria-hidden="true"/>
                    {ready ? "LINK ESTABLISHED" : "ESTABLISHING UPLINK"}
                </p>

                <div
                    className={styles.progress}
                    role="progressbar"
                    aria-label="页面加载进度"
                    aria-valuetext={ready ? "加载完成" : "加载中"}
                >
                    <span className={styles.sweep}/>
                    <span className={`${styles.sweep} ${styles.sweepAlt}`}/>
                </div>

                <div className={styles.meta} aria-hidden="true">
                    <span>BOOT SEQUENCE</span>
                    <span>{ready ? "READY" : "PLEASE STAND BY"}</span>
                </div>
            </div>
        </div>
    );
}
