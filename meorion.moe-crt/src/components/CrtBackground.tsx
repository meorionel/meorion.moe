import styles from "./CrtBackground.module.css";
import AsciiVideo from "./AsciiVideo";

type Props = {
    /** 图片地址，默认是站点 logo */
    src?: string;
    /** 字符宽度（CSS px），越小越细腻 */
    cellSize?: number;
    /** 字符密度表，从暗到亮 */
    charset?: string;
    /** 鼠标透镜 / 水滴波纹的强调色 */
    accent?: string;
    /** 渲染帧率上限 */
    maxFps?: number;
    /** 背景图片连续旋转速度（度/秒），0 = 关闭 */
    rotationSpeed?: number;
    /** 图片额外缩放（1 = 自动取景铺满；>1 继续放大；小于 1 按 1 处理，避免露黑边） */
    imageScale?: number;
    /** 额外挂到最外层背景容器上的 class */
    className?: string;
};

/**
 * uwu.cat 最终页面的整块背景，自上而下：
 *   AsciiVideo（WebGL 字符画 + CRT 屏幕）→ 中心压暗 → 扫描线 → 刷新亮带 → 胶片颗粒。
 * 不包含任何入场 / 开机动画，挂载即是最初的最终画面。
 *
 * 整块背景 pointer-events: none，并且是固定满屏的；
 * 以后往页面里放内容时，直接放在它上面就行。
 */
export default function CrtBackground({
    src = "/media/logo.png",
    cellSize,
    charset,
    accent,
    maxFps,
    rotationSpeed,
    imageScale,
    className,
}: Props) {
    return (
        <div
            className={`fixed inset-0 isolate z-0 overflow-hidden bg-black pointer-events-none${
                className ? ` ${className}` : ""
            }`}
            aria-hidden="true"
        >
            <AsciiVideo
                src={src}
                cellSize={cellSize}
                charset={charset}
                accent={accent}
                maxFps={maxFps}
                rotationSpeed={rotationSpeed}
                imageScale={imageScale}
                className="absolute inset-0 z-0"
            />

            {/* 中心压暗，给以后叠上去的文字留出可读性 */}
            <div
                className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_55%)]"
            />
            {/* CRT 扫描线 + 缓慢滚动的刷新亮带：只盖在背景上 */}
            <div className={`${styles.scanlines} absolute inset-0 z-[2]`}/>
            <div
                className={`${styles.roll} absolute inset-x-0 top-0 z-[2] h-[18vh] mix-blend-screen will-change-transform`}
            />
            {/* 全屏胶片颗粒 */}
            <div className={`${styles.grain} absolute inset-0 z-[3] opacity-[0.06] mix-blend-overlay`}/>
        </div>
    );
}
