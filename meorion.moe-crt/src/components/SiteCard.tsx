import type { CSSProperties } from "react";

import { formatTime } from "../lib/time";
import type { PlayerStatus, Playlist, PlaylistStatus, Track } from "../lib/netease";
import { ArrowUpRightIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon } from "./icons";

type Props = {
    track: Track | null;
    status: PlayerStatus;
    error: string | null;
    playing: boolean;
    currentTime: number;
    duration: number;
    playlist: Playlist | null;
    playlistStatus: PlaylistStatus;
    onToggle: () => void;
    onSeek: (time: number) => void;
    onNext: () => void;
    onPrev: () => void;
};

const GITHUB_URL = "https://github.com/meorionel/meorion.moe";

/**
 * 居中卡片，2:1 分栏：
 *   - 左：专辑封面 + 歌名 / 歌手 + 上一首 / 播放 / 下一首 + 进度条
 *   - 右：GitHub 外链，下方版权申明
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
                ? `${playlist?.tracks.length ?? 0} 首 · 点击播放开始`
                : "歌单不可用";

    const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
    const rangeStyle = {"--progress": `${progress}%`} as CSSProperties;

    return (
        <section className="panel" aria-label="meorion.moe">
            <div className="panel__grid">
                <div className="panel__music">
                    <div className="panel__head">
                        <div className={`panel__cover${cover ? "" : " is-empty"}`}>
                            {cover ? (
                                <img src={cover} alt="" draggable={false}/>
                            ) : (
                                <span className="panel__cover-mark" aria-hidden="true">♪</span>
                            )}
                        </div>

                        <div className="panel__info">
                            <p className="panel__name" title={name}>{name}</p>
                            <p className="panel__artist" title={artist}>{artist}</p>

                            <div className="panel__controls">
                                <button
                                    type="button"
                                    className="panel__btn"
                                    onClick={onPrev}
                                    disabled={!canSkip}
                                    aria-label="上一首"
                                    title="上一首"
                                >
                                    <PrevIcon/>
                                </button>
                                <button
                                    type="button"
                                    className="panel__btn panel__btn--play"
                                    onClick={onToggle}
                                    disabled={!canToggle}
                                    aria-label={playing ? "暂停" : "播放"}
                                    title={playing ? "暂停" : "播放"}
                                >
                                    {playing ? <PauseIcon/> : <PlayIcon/>}
                                </button>
                                <button
                                    type="button"
                                    className="panel__btn"
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

                    <div className="panel__progress">
                        <input
                            className="panel__range"
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
                        <div className="panel__times" aria-hidden="true">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {error && <p className="panel__error" role="alert">{error}</p>}
                </div>

                <div className="panel__split" aria-hidden="true"/>

                <div className="panel__links">
                    <a
                        className="panel__link"
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noreferrer"
                    >
                        GitHub
                        <ArrowUpRightIcon/>
                    </a>
                    <p className="panel__copy">
                        © 2026 MEORION
                        <br/>
                        ALL RIGHTS RESERVED
                    </p>
                </div>
            </div>
        </section>
    );
}
