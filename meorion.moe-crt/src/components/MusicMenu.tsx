import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

import type { PlayerStatus, Playlist, PlaylistStatus, Track } from "../lib/netease";
import { formatTime } from "../lib/time";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, RefreshIcon } from "./icons";

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
    playlist: Playlist | null;
    playlistStatus: PlaylistStatus;
    playlistError: string | null;
    currentIndex: number;
    onSelectTrack: (index: number) => void;
    onReloadPlaylist: () => void;
    onNext: () => void;
    onPrev: () => void;
};

/**
 * 背景菜单上方的音乐面板：
 *   - 手动载入单曲 ID / 链接
 *   - 写死的歌单列表，点任意一首切换
 *   - 播放 / 暂停、上一首 / 下一首、进度条
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
    playlist,
    playlistStatus,
    playlistError,
    currentIndex,
    onSelectTrack,
    onReloadPlaylist,
    onNext,
    onPrev,
}: Props) {
    const [input, setInput] = useState("");
    const listRef = useRef<HTMLOListElement>(null);
    const loading = status === "loading";
    const playlistLoading = playlistStatus === "loading";
    const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
    const rangeStyle = {"--progress": `${progress}%`} as CSSProperties;

    const hasPlaylist = Boolean(playlist && playlist.tracks.length > 0);
    const canToggle = (Boolean(track?.audio) || hasPlaylist) && !loading;
    const canSkip = hasPlaylist && !loading;

    const displayCover = track?.cover || playlist?.cover || "";
    const displayName = track?.name ?? playlist?.name ?? "未载入歌曲";
    const displaySub = track
        ? [track.artist, track.album].filter(Boolean).join(" · ")
        : playlistLoading
            ? "正在载入歌单…"
            : playlist
                ? `${playlist.tracks.length} 首 · 点击下方歌曲播放`
                : "等待歌单";

    // 自动把当前歌曲滚到列表可见区域，避免自动连播后高亮行跑到视口外
    useEffect(() => {
        if (currentIndex < 0) return;
        const list = listRef.current;
        if (!list) return;
        const row = list.children[currentIndex] as HTMLElement | undefined;
        if (!row) return;
        const rowRect = row.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();
        if (rowRect.top < listRect.top) {
            list.scrollTop += rowRect.top - listRect.top;
        } else if (rowRect.bottom > listRect.bottom) {
            list.scrollTop += rowRect.bottom - listRect.bottom;
        }
    }, [currentIndex, playlistStatus]);

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
                    placeholder="单曲 ID / 链接"
                    aria-label="网易云单曲 ID 或链接"
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
                <div className={`music-menu__cover${displayCover ? "" : " is-empty"}`}>
                    {displayCover ? (
                        <img src={displayCover} alt="" draggable={false}/>
                    ) : (
                        <span aria-hidden="true">♪</span>
                    )}
                </div>
                <div className="music-menu__meta">
                    <span className="music-menu__name" title={displayName}>{displayName}</span>
                    <span className="music-menu__artist" title={displaySub}>{displaySub}</span>
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
                    className="bg-menu__icon-btn music-menu__skip"
                    onClick={onPrev}
                    disabled={!canSkip}
                    aria-label="上一首"
                    title="上一首"
                >
                    <PrevIcon/>
                </button>
                <button
                    type="button"
                    className="music-menu__play"
                    onClick={onToggle}
                    disabled={!canToggle}
                    aria-label={playing ? "暂停" : "播放"}
                    title={playing ? "暂停" : "播放"}
                >
                    {playing ? <PauseIcon/> : <PlayIcon/>}
                </button>
                <button
                    type="button"
                    className="bg-menu__icon-btn music-menu__skip"
                    onClick={onNext}
                    disabled={!canSkip}
                    aria-label="下一首"
                    title="下一首"
                >
                    <NextIcon/>
                </button>
                <span className="music-menu__state" aria-live="polite">{stateText}</span>
                {track?.id && <span className="music-menu__id" aria-hidden="true">#{track.id}</span>}
            </div>

            <section className="music-menu__playlist" aria-label="歌单">
                <div className="music-menu__playlist-head">
                    <span className="music-menu__playlist-label">歌单</span>
                    <span className="music-menu__playlist-name" title={playlist?.name}>
                        {playlist?.name ?? "719039399"}
                    </span>
                    <span className="music-menu__playlist-count" aria-hidden="true">
                        {playlist ? `${playlist.tracks.length}` : "—"}
                    </span>
                    <button
                        type="button"
                        className="music-menu__refresh"
                        onClick={onReloadPlaylist}
                        disabled={playlistLoading}
                        aria-label="刷新歌单"
                        title="刷新歌单"
                    >
                        <RefreshIcon/>
                    </button>
                </div>

                {playlistLoading && (
                    <p className="music-menu__playlist-empty">正在载入歌单…</p>
                )}

                {playlistStatus === "error" && (
                    <div className="music-menu__playlist-error">
                        <span role="alert">{playlistError ?? "歌单载入失败"}</span>
                        <button
                            type="button"
                            className="music-menu__retry"
                            onClick={onReloadPlaylist}
                        >
                            重试
                        </button>
                    </div>
                )}

                {playlistStatus === "ready" && playlist && playlist.tracks.length > 0 && (
                    <ol className="music-menu__tracks" ref={listRef}>
                        {playlist.tracks.map((item, index) => {
                            const active = index === currentIndex;
                            return (
                                <li key={`${item.id}-${index}`}>
                                    <button
                                        type="button"
                                        className={`music-menu__track-row${active ? " is-active" : ""}`}
                                        onClick={() => onSelectTrack(index)}
                                        aria-current={active ? "true" : undefined}
                                        title={`${item.name}${item.artist ? ` · ${item.artist}` : ""}`}
                                    >
                                        <span className="music-menu__track-index">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span className="music-menu__track-meta">
                                            <span className="music-menu__track-title">{item.name}</span>
                                            <span className="music-menu__track-artist">
                                                {item.artist || item.album || " "}
                                            </span>
                                        </span>
                                        <span className="music-menu__track-duration">
                                            {active && playing ? "▶" : formatTime(item.duration)}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                )}

                {playlistStatus === "ready" && playlist && playlist.tracks.length === 0 && (
                    <p className="music-menu__playlist-empty">歌单里没有可播放的歌曲</p>
                )}
            </section>
        </aside>
    );
}
