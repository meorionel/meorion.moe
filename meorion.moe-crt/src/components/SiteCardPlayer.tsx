import type { CSSProperties } from "react";

import type { LyricLine, LyricStatus } from "../lib/lyric";
import type { PlayerStatus, Playlist, PlaylistStatus, Track } from "../lib/netease";
import { formatTime } from "../lib/time";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon } from "./icons";
import styles from "./SiteCard.module.css";

type Props = {
    track: Track | null;
    status: PlayerStatus;
    error: string | null;
    playing: boolean;
    currentTime: number;
    duration: number;
    playlist: Playlist | null;
    playlistStatus: PlaylistStatus;
    lyricLine: LyricLine | null;
    lyricStatus: LyricStatus;
    onToggle: () => void;
    onSeek: (time: number) => void;
    onNext: () => void;
    onPrev: () => void;
};

const controlButtonClass =
    "grid size-[34px] cursor-pointer place-items-center rounded-[9px] border border-white/12 bg-white/3 p-0 text-white/72 transition-[color,border-color,background,transform] enabled:hover:border-accent/45 enabled:hover:bg-accent/7 enabled:hover:text-accent enabled:active:scale-[0.94] disabled:cursor-default disabled:opacity-32 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60";

const playButtonClass =
    "grid size-[42px] cursor-pointer place-items-center rounded-full border border-accent/40 bg-accent/6 p-0 text-accent shadow-[0_0_22px_var(--accent-glow)] transition-[color,border-color,background,transform] enabled:hover:border-accent/45 enabled:hover:bg-accent/12 enabled:hover:text-accent enabled:hover:shadow-[0_0_28px_var(--accent-glow-strong)] enabled:active:scale-[0.94] disabled:cursor-default disabled:opacity-32 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60";

export default function SiteCardPlayer({
    track,
    status,
    error,
    playing,
    currentTime,
    duration,
    playlist,
    playlistStatus,
    lyricLine,
    lyricStatus,
    onToggle,
    onSeek,
    onNext,
    onPrev,
}: Props) {
    const loading = status === "loading";
    const hasPlaylist = Boolean(playlist && playlist.tracks.length > 0);
    const canToggle = (Boolean(track?.audio) || hasPlaylist) && !loading;
    const canSkip = hasPlaylist && !loading;

    const cover = track?.cover || playlist?.cover || "";
    const name = track?.name ?? playlist?.name ?? "未在播放";
    const artist = track
        ? [track.artist, track.album].filter(Boolean).join(" · ") || "未知歌手"
        : playlistStatus === "loading"
            ? "正在载入歌单…"
            : hasPlaylist
                ? `${playlist?.tracks.length ?? 0} 首 · 点击开始随机播放`
                : "歌单不可用";

    const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
    const rangeStyle = {"--progress": `${progress}%`} as CSSProperties;
    const lyricTitle = lyricLine
        ? [lyricLine.text, lyricLine.translation].filter(Boolean).join(" · ")
        : undefined;
    const lyricPlaceholder =
        lyricStatus === "loading"
            ? "歌词加载中…"
            : lyricStatus === "error"
                ? "暂无歌词"
                : lyricStatus === "ready"
                    ? "纯音乐，请欣赏"
                    : "";

    return (
        <div className="flex min-w-0 flex-col items-start">
            <div
                className="flex w-full min-w-0 items-center gap-[18px] max-md:gap-3.5"
                data-intro-item=""
            >
                <div
                    className={`relative aspect-square w-[clamp(104px,11vw,128px)] flex-none overflow-hidden rounded-[10px] border border-white/10 bg-white/4 shadow-[0_18px_44px_rgba(0,0,0,0.6)] max-md:w-[clamp(96px,30vw,120px)] ${
                        cover ? "" : "grid place-items-center"
                    }`}
                >
                    {cover ? (
                        <img src={cover} alt="" draggable={false} className="block size-full object-cover"/>
                    ) : (
                        <span className="text-[32px] text-accent/35" aria-hidden="true">♪</span>
                    )}
                </div>

                <div className="flex min-w-0 flex-col items-start">
                    <p
                        className="m-0 max-w-full truncate text-[15px] font-semibold tracking-[0.02em] text-white/94 max-md:text-sm"
                        title={name}
                    >
                        {name}
                    </p>
                    <p
                        className="mt-[5px] max-w-full truncate text-[11px] tracking-[0.08em] text-white/50"
                        title={artist}
                    >
                        {artist}
                    </p>

                    <div
                        className="mt-2 flex min-h-[27px] w-full min-w-0 flex-col text-[10px] tracking-[0.04em]"
                        title={lyricTitle}
                        data-lyric=""
                    >
                        <span className="block h-[14px] truncate leading-[14px] text-white/55">
                            {lyricLine ? lyricLine.text : <span className="text-white/25">{lyricPlaceholder}</span>}
                        </span>
                        <span className="block h-[13px] truncate text-[9px] leading-[13px] text-white/30">
                            {lyricLine?.translation ?? ""}
                        </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                        <button
                            type="button"
                            className={controlButtonClass}
                            onClick={onPrev}
                            disabled={!canSkip}
                            aria-label="上一首"
                            title="上一首"
                        >
                            <PrevIcon/>
                        </button>
                        <button
                            type="button"
                            className={playButtonClass}
                            onClick={onToggle}
                            disabled={!canToggle}
                            aria-label={playing ? "暂停" : "播放"}
                            title={playing ? "暂停" : "播放"}
                        >
                            {playing ? <PauseIcon/> : <PlayIcon/>}
                        </button>
                        <button
                            type="button"
                            className={controlButtonClass}
                            onClick={onNext}
                            disabled={!canSkip}
                            aria-label="下一首"
                            title="下一首"
                        >
                            <NextIcon/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 w-full" data-intro-item="">
                <input
                    className={`${styles.range} m-0 block h-[18px] w-full cursor-pointer appearance-none bg-transparent p-0 disabled:cursor-default disabled:opacity-55`}
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
                <div className="mt-0.5 flex justify-between text-[9px] tabular-nums tracking-[0.05em] text-white/38" aria-hidden="true">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {error && <p className="mt-2.5 text-center text-[10px] text-danger" role="alert">{error}</p>}
        </div>
    );
}
