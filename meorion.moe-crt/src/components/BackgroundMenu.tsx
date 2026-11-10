import { useEffect, useRef } from "react";

import MenuPanel from "./MenuPanel";
import styles from "./BackgroundMenu.module.css";

export type BackgroundPreset = {
    id: string;
    label: string;
    src: string;
};

type Props = {
    rotationSpeed: number;
    onRotationSpeedChange: (value: number) => void;
    image: string;
    /** 当前图片不是预设图时的显示名（比如“专辑封面”） */
    imageLabel?: string;
    imageScale: number;
    onImageScaleChange: (value: number) => void;
    presets: readonly BackgroundPreset[];
    onImageSelect: (src: string) => void;
    onImageUpload: (file: File) => void;
};

const MAX_SPEED = 30;
const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;

const formatSpeed = (value: number) => {
    if (value === 0) return "关闭";
    return `${Number.isInteger(value) ? value : value.toFixed(1)}°/s`;
};

const formatScale = (value: number) => `${Math.round(value * 100)}%`;

/**
 * 右下角的半透明控制面板：
 *   - 旋转速度（0 = 暂停；暂停后可以一键恢复上次的速度）
 *   - 背景图片：两张预设图 + 从本地选图 + 25%–250% 缩放
 * 面板本身不参与背景的层叠 / 混色，只是浮在上面。
 */
export default function BackgroundMenu({
    rotationSpeed,
    onRotationSpeedChange,
    image,
    imageLabel,
    imageScale,
    onImageScaleChange,
    presets,
    onImageSelect,
    onImageUpload,
}: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const lastSpeedRef = useRef(rotationSpeed > 0 ? rotationSpeed : 3);
    const paused = rotationSpeed === 0;
    const activePreset = presets.find((p) => p.src === image);
    const rotationNote = paused ? "旋转已关闭" : "默认旋转中";

    // 拖动滑块到 0 时记住上一个非零速度，点播放可以恢复
    useEffect(() => {
        if (rotationSpeed > 0) lastSpeedRef.current = rotationSpeed;
    }, [rotationSpeed]);

    const toggleRotation = () => {
        onRotationSpeedChange(paused ? lastSpeedRef.current : 0);
    };

    return (
        <MenuPanel title="背景" hint="BACKGROUND" label="背景控制">
            <section>
                <div className="flex items-center gap-2">
                    <label className="text-white/55" htmlFor="bg-rotation">旋转</label>
                    <span className="ml-auto tabular-nums tracking-[0.04em] text-accent">
                        {formatSpeed(rotationSpeed)}
                    </span>
                    <button
                        type="button"
                        className="ml-0.5 grid size-[22px] flex-none cursor-pointer place-items-center rounded-md border border-white/14 bg-white/4 p-0 text-white/72 transition-colors hover:border-accent/45 hover:bg-accent/8 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/65"
                        onClick={toggleRotation}
                        aria-label={paused ? "继续旋转" : "暂停旋转"}
                        title={paused ? "继续旋转" : "暂停旋转"}
                    >
                        {paused ? (
                            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                                <path d="M3 1.8 10 6 3 10.2Z" fill="currentColor"/>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                                <path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor"/>
                            </svg>
                        )}
                    </button>
                </div>
                <input
                    id="bg-rotation"
                    className={`${styles.range} mt-1.5 mb-0.5 block h-[18px] w-full cursor-pointer appearance-none bg-transparent p-0`}
                    type="range"
                    min={0}
                    max={MAX_SPEED}
                    step={0.5}
                    value={rotationSpeed}
                    onChange={(e) => onRotationSpeedChange(Number(e.target.value))}
                    aria-valuetext={formatSpeed(rotationSpeed)}
                />
                <div className="mt-0.5 flex justify-between text-[9px] tracking-[0.08em] text-white/28" aria-hidden="true">
                    <span>停止</span>
                    <span>{MAX_SPEED}°/s</span>
                </div>
                <p
                    className={`mt-[7px] text-[8px] tracking-[0.05em] transition-colors ${
                        rotationSpeed > 0 ? "text-accent/50" : "text-white/26"
                    }`}
                >
                    {rotationNote}
                </p>
            </section>

            <section className="mt-3.5 border-t border-white/7 pt-[13px]">
                <div className="flex items-center gap-2">
                    <span className="text-white/55">图片</span>
                    <span className="ml-auto tabular-nums tracking-[0.04em] text-accent">
                        {activePreset?.label ?? imageLabel ?? "自定义"}
                    </span>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                    {presets.map((preset) => {
                        const active = preset.src === image;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                className="group flex min-w-0 cursor-pointer flex-col items-center gap-[5px] border-0 bg-transparent p-0 text-[9px] tracking-[0.04em]"
                                onClick={() => onImageSelect(preset.src)}
                                aria-pressed={active}
                                title={preset.label}
                            >
                                <img
                                    src={preset.src}
                                    alt=""
                                    draggable={false}
                                    className={`block aspect-square w-full rounded-lg border bg-white/3 object-cover transition-[border-color,box-shadow,filter] ${
                                        active
                                            ? "border-accent shadow-[0_0_0_1px_var(--color-accent),0_0_16px_rgba(206,255,28,0.22)] saturate-100 brightness-100"
                                            : "border-white/12 brightness-[0.82] saturate-[0.9] group-hover:border-white/25 group-hover:brightness-100 group-hover:saturate-100"
                                    }`}
                                />
                                <span className={`max-w-full truncate ${active ? "text-accent" : "text-white/42"}`}>
                                    {preset.label}
                                </span>
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        className="group flex min-w-0 cursor-pointer flex-col items-center gap-[5px] border-0 bg-transparent p-0 text-[9px] tracking-[0.04em]"
                        onClick={() => fileRef.current?.click()}
                        title="上传本地图片"
                    >
                        <span
                            className="grid aspect-square w-full place-items-center rounded-lg border border-dashed border-white/12 bg-white/3 text-white/45 transition-colors group-hover:border-accent/50 group-hover:bg-accent/5 group-hover:text-accent"
                            aria-hidden="true"
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                        </span>
                        <span className="max-w-full truncate text-white/42">上传</span>
                    </button>
                </div>

                <div className="mt-[13px] flex items-center gap-2">
                    <label className="text-white/55" htmlFor="bg-scale">缩放</label>
                    <span className="ml-auto tabular-nums tracking-[0.04em] text-accent">
                        {formatScale(imageScale)}
                    </span>
                </div>
                <input
                    id="bg-scale"
                    className={`${styles.range} mt-1.5 mb-0.5 block h-[18px] w-full cursor-pointer appearance-none bg-transparent p-0`}
                    type="range"
                    min={MIN_SCALE}
                    max={MAX_SCALE}
                    step={0.05}
                    value={imageScale}
                    onChange={(e) => onImageScaleChange(Number(e.target.value))}
                    aria-valuetext={formatScale(imageScale)}
                />
                <div className="mt-0.5 flex justify-between text-[9px] tracking-[0.08em] text-white/28" aria-hidden="true">
                    <span>{formatScale(MIN_SCALE)}</span>
                    <span>{formatScale(MAX_SCALE)}</span>
                </div>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file && file.type.startsWith("image/")) onImageUpload(file);
                        e.currentTarget.value = "";
                    }}
                />
            </section>
        </MenuPanel>
    );
}
