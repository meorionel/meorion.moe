import type { ReactNode } from "react";

type Props = {
    title: string;
    hint: string;
    label: string;
    className?: string;
    children: ReactNode;
};

/**
 * 右下角两块浮层菜单共用的玻璃面板 + 标题栏。
 * 尺寸 / 配色 / 字体全部走 Tailwind，面板细节（滑块等）留在各自的 module.css 里。
 */
export default function MenuPanel({title, hint, label, className, children}: Props) {
    return (
        <aside
            className={`relative box-border w-[min(292px,calc(100vw_-_32px))] rounded-[14px] border border-white/14 bg-linear-to-b from-[rgba(18,22,16,0.62)] to-[rgba(6,8,6,0.68)] p-3.5 font-ascii text-[11px] leading-[1.3] tracking-[0.06em] text-white/82 shadow-[0_18px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[18px] backdrop-saturate-[1.15] select-none touch-auto max-[420px]:w-[min(272px,calc(100vw_-_24px))] max-[420px]:p-3${
                className ? ` ${className}` : ""
            }`}
            aria-label={label}
            data-bg-ui=""
        >
            <header
                className="mb-3 flex items-center gap-2 border-b border-white/8 pb-2.5 text-[11px] tracking-[0.24em] text-white/90 uppercase"
            >
                <span
                    className="size-1.5 flex-none rounded-full bg-accent shadow-[0_0_10px_rgba(206,255,28,0.8)]"
                    aria-hidden="true"
                />
                <span>{title}</span>
                <span className="ml-auto text-[8px] tracking-[0.16em] text-white/28" aria-hidden="true">
                    {hint}
                </span>
            </header>

            {children}
        </aside>
    );
}
