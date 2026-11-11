import type { CSSProperties, ReactNode } from "react";

import styles from "./Tooltip.module.css";

type Props = {
    id: string;
    /** 气泡头部的小标题，比如 HEART NOTE / PEER NODE 01 */
    head: ReactNode;
    /** 气泡正文 */
    children: ReactNode;
    /** 触发区内容 */
    trigger: ReactNode;
    /** right：贴右边缘（心率）；center：水平居中（友链） */
    align?: "right" | "center";
    /** 触发区附加的 class，用来控制布局 */
    className?: string;
    /** 气泡附加的 class，用来做按场景隐藏等 */
    bubbleClassName?: string;
    /** 气泡的内联变量，主要用来单独调箭头位置 */
    bubbleStyle?: CSSProperties;
    tabIndex?: number;
    ariaLabel?: string;
    describedBy?: string;
};

/**
 * 站内统一的终端风格 Tooltip，心率说明和友链共用同一套气泡。
 *
 * `.root` 故意不建立定位上下文：气泡会贴着调用方最近的 `position: relative` 祖先，
 * 心率气泡因此仍然对齐到 `.heartLine`，和旧的实现保持一致。
 */
export default function Tooltip({
    id,
    head,
    children,
    trigger,
    align = "right",
    className,
    bubbleClassName,
    bubbleStyle,
    tabIndex,
    ariaLabel,
    describedBy,
}: Props) {
    return (
        <span
            className={`${styles.root}${className ? ` ${className}` : ""}`}
            tabIndex={tabIndex}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
        >
            {trigger}
            <span
                id={id}
                role="tooltip"
                className={`${styles.bubble}${align === "center" ? ` ${styles.alignCenter}` : ""}${
                    bubbleClassName ? ` ${bubbleClassName}` : ""
                }`}
                style={bubbleStyle}
            >
                <span className={styles.head}>
                    <span className={styles.dot} aria-hidden="true"/>
                    {head}
                </span>
                <span className={styles.text}>{children}</span>
                <span className={styles.arrow} aria-hidden="true"/>
            </span>
        </span>
    );
}
