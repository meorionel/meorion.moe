import AsciiVideo from "./AsciiVideo";

type Props = {
    /** 图片地址，默认是随项目附带的猫咪图片 */
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
    /** 图片额外缩放（1 = cover；>1 放大） */
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
    src = "/media/avatar.png",
    cellSize,
    charset,
    accent,
    maxFps,
    rotationSpeed,
    imageScale,
    className,
}: Props) {
    return (
        <div className={`crt-stage${className ? ` ${className}` : ""}`} aria-hidden="true">
            <AsciiVideo
                src={src}
                cellSize={cellSize}
                charset={charset}
                accent={accent}
                maxFps={maxFps}
                rotationSpeed={rotationSpeed}
                imageScale={imageScale}
                className="crt-bg"
            />

            {/* 中心压暗，给以后叠上去的文字留出可读性 */}
            <div className="crt-dim"/>
            {/* CRT 扫描线 + 缓慢滚动的刷新亮带：只盖在背景上 */}
            <div className="crt-scanlines"/>
            <div className="crt-roll"/>
            {/* 全屏胶片颗粒 */}
            <div className="crt-grain"/>
        </div>
    );
}
