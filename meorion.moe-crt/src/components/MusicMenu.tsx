import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";

import type { PlayerStatus, Track } from "../lib/netease";

type Props = {
    track: Track | null;
    status: PlayerStatus;
    error: string | null;
    playing: boolean;
    currentTime: number;
    duration: number;
    onLoad: (input: string) => void;
    onToggle: () => void;
    onSeek: (time: number) => void;
};

const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
    const whole = Math.floor(seconds);
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

const PlayIcon = () => (
    <svg viewBox="0 0 12 12" width="13" height="13" aria-hidden="true">
        <path d="M3 1.8 10 6 3 10.2Z" fill="currentColor"/>
    </svg>
);

const PauseIcon = () => (
    <svg viewBox="0 0 12 12" width="13" height="13" aria-hidden="true">
        <path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor"/>
    </svg>
);

/**
 * 背景菜单上方的音乐面板：输入网易云歌曲 ID / 链接即可播放，
 * 载入后专辑封面会自动替换背景图；进度条支持拖动跳转。
 */
export default function MusicMenu({
    track,
    status,
    error,
    playing,
    currentTime,
    duration,
    onLoad,
    onToggle,
    onSeek,
}: Props) {
    const [input, setInput] = useState("");
    const loading = status === "loading";
    const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
    const rangeStyle = {"--progress": `${progress}%`} as CSSProperties;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = input.trim();
        if (!value || loading) return;
        onLoad(value);
    };

    const stateText = loading
        ? "正在解析…"
        : error
            ? (track ? "播放异常" : "载入失败")
            : track
                ? (playing ? "正在播放" : "已暂停")
                : "待机";

    return (
        <aside className="bg-menu music-menu" aria-label="音乐控制" data-bg-ui="">
            <header className="bg-menu__head">
                <span className="bg-menu__dot" aria-hidden="true"/>
                <span>音乐</span>
                <span className="bg-menu__hint" aria-hidden="true">NETEASE</span>
            </header>

            <form className="music-menu__search" onSubmit={submit}>
                <input
                    className="music-menu__input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="歌曲 ID 或链接"
                    aria-label="网易云歌曲 ID 或链接"
                    autoComplete="off"
                    spellCheck={false}
                />
                <button
                    type="submit"
                    className="music-menu__load"
                    disabled={loading || !input.trim()}
                >
                    {loading ? "解析中" : "载入"}
                </button>
            </form>

            {error && <p className="music-menu__error" role="alert">{error}</p>}

            <div className="music-menu__track">
                <div className={`music-menu__cover${track?.cover ? "" : " is-empty"}`}>
                    {track?.cover ? (
                        <img src={track.cover} alt="" draggable={false}/>
                    ) : (
                        <span aria-hidden="true">♪</span>
                    )}
                </div>
                <div className="music-menu__meta">
                    <span className="music-menu__name" title={track?.name}>
                        {track?.name ?? "未载入歌曲"}
                    </span>
                    <span className="music-menu__artist" title={track ? [track.artist, track.album].filter(Boolean).join(" · ") : undefined}>
                        {track ? [track.artist, track.album].filter(Boolean).join(" · ") : "输入 ID 后回车播放"}
                    </span>
                </div>
            </div>

            <div className="music-menu__progress">
                <input
                    className="bg-menu__range music-menu__range"
                    type="range"
                    min={0}
                    max={duration > 0 ? duration : 1}
                    step={0.1}
                    value={duration > 0 ? Math.min(currentTime, duration) : 0}
                    style={rangeStyle}
                    disabled={duration <= 0}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    aria-label="播放进度"
                    aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
                />
                <div className="music-menu__times" aria-hidden="true">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="music-menu__controls">
                <button
                    type="button"
                    className="music-menu__play"
                    onClick={onToggle}
                    disabled={!track}
                    aria-label={playing ? "暂停" : "播放"}
                    title={playing ? "暂停" : "播放"}
                >
                    {playing ? <PauseIcon/> : <PlayIcon/>}
                </button>
                <span className="music-menu__state" aria-live="polite">{stateText}</span>
                {track?.id && <span className="music-menu__id" aria-hidden="true">#{track.id}</span>}
            </div>
        </aside>
    );
}
