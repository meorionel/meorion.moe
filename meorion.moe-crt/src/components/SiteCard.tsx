import type { CSSProperties } from "react";

import { formatTime } from "../lib/time";
import type { LyricLine, LyricStatus } from "../lib/lyric";
import type { PlayerStatus, Playlist, PlaylistStatus, Track } from "../lib/netease";
import { ArrowUpRightIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from "./icons";
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

/** 右下角外链列表：加新链接只改这里，渲染走下面的循环 */
const SOCIAL_LINKS = [
    {label: "GitHub", href: "https://github.com/meorionel/meorion.moe"},
    {label: "X", href: "https://x.com/meorionel"},
] as const;

const socialLinkClass =
    "group relative inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.18em] text-white/85 uppercase no-underline transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 after:content-[''] hover:text-accent hover:after:origin-left hover:after:scale-x-100 focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent/60";

const controlButtonClass =
    "grid size-[34px] cursor-pointer place-items-center rounded-[9px] border border-white/12 bg-white/3 p-0 text-white/72 transition-[color,border-color,background,transform] enabled:hover:border-accent/45 enabled:hover:bg-accent/7 enabled:hover:text-accent enabled:active:scale-[0.94] disabled:cursor-default disabled:opacity-32 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60";

const playButtonClass =
    "grid size-[42px] cursor-pointer place-items-center rounded-full border border-accent/40 bg-accent/6 p-0 text-accent shadow-[0_0_22px_var(--accent-glow)] transition-[color,border-color,background,transform] enabled:hover:border-accent/45 enabled:hover:bg-accent/12 enabled:hover:text-accent enabled:hover:shadow-[0_0_28px_var(--accent-glow-strong)] enabled:active:scale-[0.94] disabled:cursor-default disabled:opacity-32 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/60";

/**
 * 居中卡片，2:1 分栏：
 *   - 左：专辑封面 + 歌名 / 歌手 + 上一首 / 播放 / 下一首 + 进度条
 *   - 右：外链（GitHub / X），下方版权申明
 */
export default function SiteCard({
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
        <section
            className={`relative box-border w-3xl rounded-[14px] border border-white/10 bg-[radial-gradient(120%_90%_at_0%_0%,var(--accent-tint),transparent_55%),linear-gradient(180deg,rgba(10,12,8,0.74),rgba(3,4,3,0.8))] p-[22px_26px] font-ascii text-[11px] leading-[1.3] tracking-[0.05em] text-white/82 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[24px] backdrop-saturate-[1.15] pointer-events-auto before:pointer-events-none before:absolute before:inset-x-3.5 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/38 before:to-transparent before:content-[''] max-sm:w-full max-sm:rounded-xl max-sm:p-[20px_18px] ${styles.panel}`}
            aria-label="meorion.moe"
        >
            <div className="grid grid-cols-[minmax(0,2fr)_1px_minmax(0,1fr)] items-stretch gap-[30px] max-sm:grid-cols-1 max-sm:gap-[18px]">
                <div className="flex min-w-0 flex-col items-start">
                    <div className="flex w-full min-w-0 items-center gap-[18px] max-sm:gap-3.5">
                        <div
                            className={`relative aspect-square w-[clamp(104px,11vw,128px)] flex-none overflow-hidden rounded-[10px] border border-white/10 bg-white/4 shadow-[0_18px_44px_rgba(0,0,0,0.6)] max-sm:w-[clamp(96px,30vw,120px)] ${
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
                                className="m-0 max-w-full truncate text-[15px] font-semibold tracking-[0.02em] text-white/94 max-sm:text-sm"
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

                            <p
                                className="mt-2 h-4 w-full truncate text-[10px] leading-4 tracking-[0.04em] text-white/55"
                                title={lyricTitle}
                                data-lyric=""
                            >
                                {lyricLine ? (
                                    <>
                                        {lyricLine.text}
                                        {lyricLine.translation && (
                                            <span className="text-white/30"> · {lyricLine.translation}</span>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-white/25">{lyricPlaceholder}</span>
                                )}
                            </p>

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

                    <div className="mt-4 w-full">
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

                <div className="self-stretch bg-linear-to-b from-transparent via-white/18 to-transparent max-sm:hidden" aria-hidden="true"/>

                <div className="flex min-w-0 flex-col items-end justify-between gap-5 max-sm:w-full max-sm:gap-3.5">
                    <div className="flex flex-col items-end gap-4">
                        {SOCIAL_LINKS.map(({label, href}) => (
                            <a
                                key={href}
                                className={socialLinkClass}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {label}
                                <ArrowUpRightIcon/>
                            </a>
                        ))}
                    </div>
                    <p className="m-0 text-right text-[10px] uppercase leading-[1.7] tracking-[0.16em] text-white/35">
                        © 2026 MEORION
                        <br/>
                        ALL RIGHTS RESERVED
                    </p>
                </div>
            </div>
        </section>
    );
}
