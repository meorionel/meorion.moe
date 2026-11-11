import { useEffect, useRef } from "react";

import styles from "./IntroOverlay.module.css";

/**
 * 首屏入场：
 *   黑幕 → 中线亮起 → 上下帘拉开 → CRT 背景对焦 → 卡片抬起 / 内容错峰出现。
 *
 * GSAP 动态加载，不进入首屏主包；`prefers-reduced-motion` 下直接跳过。
 * 动画结束后会把所有内联 transform / opacity 清掉，避免影响 fixed 布局。
 */
export default function IntroOverlay() {
    const overlayRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const beamRef = useRef<HTMLDivElement>(null);
    const flashRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            overlay.style.display = "none";
            return;
        }

        let disposed = false;
        let cleanup: (() => void) | undefined;

        void import("gsap")
            .then(({gsap}) => {
                if (disposed) return;

                const style = window.getComputedStyle(overlay);
                // CSS 兜底已经先把黑帘收掉了（脚本加载太慢），就不再补动画
                if (style.display === "none" || style.visibility === "hidden") return;

                const bg = document.querySelector<HTMLElement>("[data-intro-bg]");
                const card = document.querySelector<HTMLElement>("[data-intro-card]");
                const top = topRef.current;
                const bottom = bottomRef.current;
                const beam = beamRef.current;
                const flash = flashRef.current;

                if (!bg || !card || !top || !bottom || !beam || !flash) {
                    overlay.style.display = "none";
                    return;
                }

                // 动画接管后关掉 CSS 兜底，避免它在中途把帘子收走
                overlay.style.animation = "none";

                const items = gsap.utils.toArray<HTMLElement>("[data-intro-item]");
                const ctx = gsap.context(() => {
                    gsap.set(bg, {opacity: 0, scale: 1.045, transformOrigin: "50% 50%"});
                    gsap.set(card, {opacity: 0, y: 26, scale: 0.982, transformOrigin: "50% 55%"});
                    gsap.set(items, {opacity: 0, y: 12});

                    gsap.timeline({
                        defaults: {ease: "power3.out"},
                        onComplete: () => {
                            gsap.set([bg, card, ...items], {clearProps: "all"});
                            gsap.set(overlay, {display: "none"});
                        },
                    })
                        .fromTo(
                            beam,
                            {scaleX: 0.12, opacity: 0.18},
                            {scaleX: 1, opacity: 1, duration: 0.42, ease: "power2.out"},
                            0,
                        )
                        .to(top, {yPercent: -101, duration: 0.95, ease: "expo.inOut"}, 0.5)
                        .to(bottom, {yPercent: 101, duration: 0.95, ease: "expo.inOut"}, 0.5)
                        .to(beam, {scaleX: 1.08, opacity: 0, duration: 0.32, ease: "power2.out"}, 0.5)
                        .to(flash, {opacity: 0.55, duration: 0.14, ease: "power1.out"}, 0.5)
                        .to(flash, {opacity: 0, duration: 0.42, ease: "power2.in"}, 0.64)
                        .to(bg, {opacity: 1, scale: 1, duration: 1.2, ease: "power2.out"}, 0.32)
                        .to(card, {opacity: 1, y: 0, scale: 1, duration: 0.95, ease: "power3.out"}, 0.62)
                        .to(
                            items,
                            {opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out"},
                            0.78,
                        )
                        .to(card, {opacity: 0.9, duration: 0.07, ease: "none"}, 1.38)
                        .to(card, {opacity: 1, duration: 0.18, ease: "none"}, 1.45)
                        .set(overlay, {display: "none"}, 1.76);
                });

                cleanup = () => ctx.revert();
            })
            .catch(() => {
                if (!disposed) overlay.style.display = "none";
            });

        return () => {
            disposed = true;
            cleanup?.();
        };
    }, []);

    return (
        <div ref={overlayRef} className={styles.overlay} data-intro-overlay aria-hidden="true">
            <div ref={topRef} className={`${styles.half} ${styles.top}`}/>
            <div ref={bottomRef} className={`${styles.half} ${styles.bottom}`}/>
            <div ref={flashRef} className={styles.flash}/>
            <div ref={beamRef} className={styles.beam}/>
        </div>
    );
}
