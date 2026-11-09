import { useEffect, useRef } from "react";

export type BackgroundPreset = {
    id: string;
    label: string;
    src: string;
};

type Props = {
    rotationSpeed: number;
    /** 音乐是否正在播放；旋转只在播放时真正生效 */
    musicPlaying: boolean;
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
    musicPlaying,
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
    const rotationNote = paused
        ? "旋转已关闭"
        : musicPlaying
            ? "音乐播放中 · 正在旋转"
            : "播放音乐后才会旋转";

    // 拖动滑块到 0 时记住上一个非零速度，点播放可以恢复
    useEffect(() => {
        if (rotationSpeed > 0) lastSpeedRef.current = rotationSpeed;
    }, [rotationSpeed]);

    const toggleRotation = () => {
        onRotationSpeedChange(paused ? lastSpeedRef.current : 0);
    };

    return (
        <aside className="bg-menu" aria-label="背景控制" data-bg-ui="">
            <header className="bg-menu__head">
                <span className="bg-menu__dot" aria-hidden="true"/>
                <span>背景</span>
                <span className="bg-menu__hint" aria-hidden="true">BACKGROUND</span>
            </header>

            <section className="bg-menu__group">
                <div className="bg-menu__row">
                    <label className="bg-menu__label" htmlFor="bg-rotation">旋转</label>
                    <span className="bg-menu__value">{formatSpeed(rotationSpeed)}</span>
                    <button
                        type="button"
                        className="bg-menu__icon-btn"
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
                    className="bg-menu__range"
                    type="range"
                    min={0}
                    max={MAX_SPEED}
                    step={0.5}
                    value={rotationSpeed}
                    onChange={(e) => onRotationSpeedChange(Number(e.target.value))}
                    aria-valuetext={formatSpeed(rotationSpeed)}
                />
                <div className="bg-menu__scale" aria-hidden="true">
                    <span>停止</span>
                    <span>{MAX_SPEED}°/s</span>
                </div>
                <p className={`bg-menu__note${rotationSpeed > 0 && musicPlaying ? " is-active" : ""}`}>
                    {rotationNote}
                </p>
            </section>

            <section className="bg-menu__group">
                <div className="bg-menu__row">
                    <span className="bg-menu__label">图片</span>
                    <span className="bg-menu__value">{activePreset?.label ?? imageLabel ?? "自定义"}</span>
                </div>
                <div className="bg-menu__thumbs">
                    {presets.map((preset) => {
                        const active = preset.src === image;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                className={`bg-menu__thumb${active ? " is-active" : ""}`}
                                onClick={() => onImageSelect(preset.src)}
                                aria-pressed={active}
                                title={preset.label}
                            >
                                <img src={preset.src} alt="" draggable={false}/>
                                <span>{preset.label}</span>
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        className="bg-menu__thumb bg-menu__thumb--upload"
                        onClick={() => fileRef.current?.click()}
                        title="上传本地图片"
                    >
                        <span className="bg-menu__upload-box" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                        </span>
                        <span>上传</span>
                    </button>
                </div>

                <div className="bg-menu__row bg-menu__row--zoom">
                    <label className="bg-menu__label" htmlFor="bg-scale">缩放</label>
                    <span className="bg-menu__value">{formatScale(imageScale)}</span>
                </div>
                <input
                    id="bg-scale"
                    className="bg-menu__range"
                    type="range"
                    min={MIN_SCALE}
                    max={MAX_SCALE}
                    step={0.05}
                    value={imageScale}
                    onChange={(e) => onImageScaleChange(Number(e.target.value))}
                    aria-valuetext={formatScale(imageScale)}
                />
                <div className="bg-menu__scale" aria-hidden="true">
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
        </aside>
    );
}
