import type { CSSProperties } from "react";

import type { HeartRate } from "../lib/heart";
import { formatTime } from "../lib/time";
import type { LyricLine, LyricStatus } from "../lib/lyric";
import type { PlayerStatus, Playlist, PlaylistStatus, Track } from "../lib/netease";
import { PROFILE, SOCIAL_LINKS } from "../lib/site";
import { ArrowUpRightIcon, HeartIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from "./icons";
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
    heartRate: HeartRate;
    lyricLine: LyricLine | null;
    lyricStatus: LyricStatus;
    onToggle: () => void;
    onSeek: (time: number) => void;
    onNext: () => void;
    onPrev: () => void;
};

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
    heartRate,
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

    const heartLive = heartRate.status === "live" && heartRate.bpm !== null;
    const heartTone = heartRate.status === "live"
        ? "text-status-live"
        : heartRate.status === "stale"
            ? "text-status-stale"
            : heartRate.status === "waiting"
                ? "text-status-idle"
                : "text-status-offline";
    const bpm = heartRate.bpm === null ? "--" : String(heartRate.bpm);
    const heartbeatStyle = heartLive && heartRate.bpm
        ? ({"--heartbeat": `${(60 / heartRate.bpm).toFixed(2)}s`} as CSSProperties)
        : undefined;
    const heartTitle = heartRate.bpm === null
        ? "心率暂时不可用"
        : heartRate.status === "live"
            ? `心率 ${heartRate.bpm} BPM`
            : `心率 ${heartRate.bpm} BPM（数据可能不是最新）`;

    return (
        <section
            className={`relative box-border w-full max-w-3xl rounded-[14px] border border-white/10 bg-[radial-gradient(120%_90%_at_0%_0%,var(--accent-tint),transparent_55%),linear-gradient(180deg,rgba(10,12,8,0.74),rgba(3,4,3,0.8))] p-[22px_26px] font-ascii text-[11px] leading-[1.3] tracking-[0.05em] text-white/82 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[24px] backdrop-saturate-[1.15] pointer-events-auto before:pointer-events-none before:absolute before:inset-x-3.5 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/38 before:to-transparent before:content-[''] max-md:w-full max-md:rounded-xl max-md:p-[20px_18px] ${styles.panel}`}
            aria-label="meorion.moe"
            data-intro-card=""
        >
            <div className="grid grid-cols-[minmax(0,2fr)_1px_minmax(0,1fr)] items-stretch gap-[30px] max-md:grid-cols-1 max-md:gap-[18px]">
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

                <div className="self-stretch bg-linear-to-b from-transparent via-white/18 to-transparent max-md:hidden" aria-hidden="true"/>

                <div className="flex min-w-0 flex-col items-end justify-between gap-4 max-md:w-full max-md:gap-3">
                    <div className="flex w-full min-w-0 flex-col items-end gap-3.5">
                        <div
                            className="flex w-full items-center justify-end gap-2.5 max-md:justify-start"
                            data-intro-item=""
                        >
                            <div className="min-w-0 text-left max-md:text-left">
                                <p className="m-0 flex items-baseline justify-end gap-2 whitespace-nowrap max-md:justify-start text-[13px] font-semibold tracking-[0.16em] text-white/94">
                                    {PROFILE.name}
                                    <span className="text-[9px] font-normal tracking-[0.06em] text-white/38">
                                        {PROFILE.handle}
                                    </span>
                                </p>
                                <p className="mt-1 text-[10px] leading-[1.55] tracking-[0.05em] text-white/58">
                                    {PROFILE.bio}
                                </p>
                                <p
                                    className={`mt-1.5 flex items-center justify-end gap-1 max-md:justify-start text-[9px] uppercase tracking-[0.15em] ${
                                        heartLive ? "text-white/34" : "text-white/22"
                                    } ${styles.heartLine}`}
                                >
                                    <span
                                        className={styles.heartTrigger}
                                        aria-label={heartTitle}
                                        aria-describedby="heart-rate-note"
                                        tabIndex={0}
                                    >
                                        <span
                                            className={`flex flex-none items-center -mt-1 text-accent ${heartLive ? styles.heart : ""}`}
                                            style={heartbeatStyle}
                                            aria-hidden="true"
                                        >
                                            <HeartIcon/>
                                        </span>
                                        <span className={`tabular-nums tracking-[0.08em] ${heartLive ? "text-white/80" : "text-white/38"}`}>
                                            {bpm}
                                        </span>
                                        <span className={heartLive ? "text-white/42" : "text-white/24"}>BPM</span>

                                        <span id="heart-rate-note" className={styles.heartTooltip} role="tooltip">
                                            <span className={styles.heartTooltipHead}>
                                                <span className={styles.heartTooltipDot} aria-hidden="true"/>
                                                HEART NOTE
                                            </span>
                                            <span className={styles.heartTooltipText}>
                                                如果你发现我的心率一直很高 这是正常的，我有些小毛病。
                                            </span>
                                            <span className={styles.heartTooltipArrow} aria-hidden="true"/>
                                        </span>
                                    </span>
                                    <span className="text-white/18" aria-hidden="true">/</span>
                                    <span>{PROFILE.location}</span>
                                </p>
                            </div>

                            <div className="relative flex-none max-md:order-first">
                                <div className="relative size-[60px] border-b border-accent/35">
                                    <span className={`absolute inset-0 ${styles.avatarCrop}`}>
                                        <img
                                            src={PROFILE.avatar}
                                            alt={`${PROFILE.name} 的头像`}
                                            draggable={false}
                                            className="absolute left-1/2 top-[-10%] w-[110%] max-w-none -translate-x-1/2"
                                        />
                                    </span>
                                </div>
                                <span
                                    className={`absolute -right-[3px] -bottom-[3px] size-[10px] rounded-full border-2 border-[#0a0c08] bg-current ${heartTone} ${styles.statusDot}`}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>

                        <div
                            className="flex flex-col items-end gap-3 max-md:flex-row max-md:items-center max-md:gap-6 max-md:self-start"
                            data-intro-item=""
                        >
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
                    </div>

                    <div className="h-px w-full bg-linear-to-l from-white/16 via-white/8 to-transparent" aria-hidden="true"/>

                    <p
                        className="m-0 text-right text-[10px] uppercase leading-[1.7] tracking-[0.16em] text-white/35"
                        data-intro-item=""
                    >
                        © 2026 MEORION
                        <br/>
                        ALL RIGHTS RESERVED
                    </p>
                </div>
            </div>
        </section>
    );
}
