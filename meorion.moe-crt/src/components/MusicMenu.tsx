import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

import type { PlayerStatus, Playlist, PlaylistStatus, Track } from "../lib/netease";
import { formatTime } from "../lib/time";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, RefreshIcon } from "./icons";
import MenuPanel from "./MenuPanel";
import styles from "./MusicMenu.module.css";

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

const skipButtonClass =
    "grid size-[26px] flex-none cursor-pointer place-items-center rounded-full border border-white/14 bg-white/4 p-0 text-white/72 transition-colors hover:border-accent/45 hover:bg-accent/8 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/65 disabled:cursor-default disabled:opacity-30 disabled:hover:border-white/14 disabled:hover:bg-white/4 disabled:hover:text-white/72";

const playButtonClass =
    "grid size-[30px] flex-none cursor-pointer place-items-center rounded-full border border-accent/50 bg-accent/10 p-0 text-accent transition-[background-color,border-color,box-shadow] enabled:hover:border-accent enabled:hover:bg-accent/18 enabled:hover:shadow-[0_0_16px_rgba(206,255,28,0.2)] disabled:cursor-default disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/65";

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
        <MenuPanel title="音乐" hint="NETEASE" label="音乐控制">
            <form className="flex gap-1.5" onSubmit={submit}>
                <input
                    className="h-7 min-w-0 flex-1 rounded-[7px] border border-white/14 bg-black/28 px-2 text-[11px] tracking-[0.04em] text-foreground outline-none transition-[border-color,background-color,box-shadow] placeholder:text-white/28 focus:border-accent/55 focus:bg-black/40 focus:shadow-[0_0_0_3px_rgba(206,255,28,0.08)]"
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
                    className="h-7 flex-none cursor-pointer rounded-[7px] border border-accent/45 bg-accent/8 px-2.5 text-[10px] tracking-[0.08em] text-accent transition-colors enabled:hover:border-accent/75 enabled:hover:bg-accent/14 disabled:cursor-default disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/65"
                    disabled={loading || !input.trim()}
                >
                    {loading ? "解析中" : "载入"}
                </button>
            </form>

            {error && <p className="mt-2 text-[9px] leading-[1.5] tracking-[0.02em] text-danger" role="alert">{error}</p>}

            <div className="mt-3 flex items-center gap-2.5">
                <div
                    className={`grid size-[42px] flex-none place-items-center overflow-hidden rounded-lg border border-white/12 bg-white/4 ${
                        displayCover ? "" : "text-base text-white/28"
                    }`}
                >
                    {displayCover ? (
                        <img src={displayCover} alt="" draggable={false} className="block size-full object-cover"/>
                    ) : (
                        <span aria-hidden="true">♪</span>
                    )}
                </div>
                <div className="flex min-w-0 flex-col gap-[3px]">
                    <span className="truncate text-xs tracking-[0.02em] text-white/92" title={displayName}>
                        {displayName}
                    </span>
                    <span className="truncate text-[9px] tracking-[0.04em] text-white/42" title={displaySub}>
                        {displaySub}
                    </span>
                </div>
            </div>

            <div className="mt-2">
                <input
                    className={`${styles.range} mt-1.5 mb-0.5 block h-[18px] w-full cursor-pointer appearance-none bg-transparent p-0 disabled:cursor-default disabled:opacity-55`}
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
                <div className="-mt-0.5 flex justify-between text-[9px] tabular-nums tracking-[0.04em] text-white/38" aria-hidden="true">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="mt-2.5 flex items-center gap-[9px]">
                <button
                    type="button"
                    className={skipButtonClass}
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
                    className={skipButtonClass}
                    onClick={onNext}
                    disabled={!canSkip}
                    aria-label="下一首"
                    title="下一首"
                >
                    <NextIcon/>
                </button>
                <span className="whitespace-nowrap text-[9px] tracking-[0.08em] text-white/50" aria-live="polite">
                    {stateText}
                </span>
                {track?.id && (
                    <span className="ml-auto max-w-24 truncate text-[9px] text-white/26" aria-hidden="true">
                        #{track.id}
                    </span>
                )}
            </div>

            <section className="mt-3 border-t border-white/7 pt-2.5" aria-label="歌单">
                <div className="mb-1.5 flex min-w-0 items-center gap-1.5 text-[9px] tracking-[0.04em]">
                    <span className="flex-none text-white/42">歌单</span>
                    <span className="min-w-0 flex-1 truncate text-white/55" title={playlist?.name}>
                        {playlist?.name ?? "719039399"}
                    </span>
                    <span className="flex-none tabular-nums text-white/26" aria-hidden="true">
                        {playlist ? `${playlist.tracks.length}` : "—"}
                    </span>
                    <button
                        type="button"
                        className="grid size-5 flex-none cursor-pointer place-items-center rounded-[5px] border border-transparent bg-transparent p-0 text-white/40 transition-colors enabled:hover:border-accent/25 enabled:hover:bg-accent/6 enabled:hover:text-accent disabled:cursor-default disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent/60"
                        onClick={onReloadPlaylist}
                        disabled={playlistLoading}
                        aria-label="刷新歌单"
                        title="刷新歌单"
                    >
                        <RefreshIcon/>
                    </button>
                </div>

                {playlistLoading && (
                    <p className="mt-2 text-[9px] text-white/30">正在载入歌单…</p>
                )}

                {playlistStatus === "error" && (
                    <div className="mt-2 flex items-start gap-2 text-[9px] leading-[1.5] text-danger">
                        <span className="min-w-0 flex-1" role="alert">{playlistError ?? "歌单载入失败"}</span>
                        <button
                            type="button"
                            className="flex-none cursor-pointer rounded-[5px] border border-danger/40 bg-transparent px-1.5 py-px text-[8px] text-danger hover:bg-danger/8 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent/60"
                            onClick={onReloadPlaylist}
                        >
                            重试
                        </button>
                    </div>
                )}

                {playlistStatus === "ready" && playlist && playlist.tracks.length > 0 && (
                    <ol
                        className="m-0 max-h-[150px] list-none overflow-y-auto overscroll-contain p-0 pr-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.16)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/16"
                        ref={listRef}
                    >
                        {playlist.tracks.map((item, index) => {
                            const active = index === currentIndex;
                            return (
                                <li key={`${item.id}-${index}`}>
                                    <button
                                        type="button"
                                        className={`flex w-full cursor-pointer items-center gap-2 rounded-md border-0 px-1.5 py-[5px] text-left text-[10px] tracking-[0.02em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent/60 ${
                                            active
                                                ? "bg-accent/8 text-accent"
                                                : "bg-transparent text-white/72 hover:bg-white/5"
                                        }`}
                                        onClick={() => onSelectTrack(index)}
                                        aria-current={active ? "true" : undefined}
                                        title={`${item.name}${item.artist ? ` · ${item.artist}` : ""}`}
                                    >
                                        <span
                                            className={`w-[18px] flex-none text-[8px] tabular-nums ${
                                                active ? "text-accent/55" : "text-white/28"
                                            }`}
                                        >
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span className="flex min-w-0 flex-1 flex-col gap-px">
                                            <span className="truncate">{item.name}</span>
                                            <span
                                                className={`truncate text-[8px] ${
                                                    active ? "text-accent/50" : "text-white/34"
                                                }`}
                                            >
                                                {item.artist || item.album || " "}
                                            </span>
                                        </span>
                                        <span
                                            className={`flex-none text-[8px] tabular-nums ${
                                                active ? "text-accent/75" : "text-white/28"
                                            }`}
                                        >
                                            {active && playing ? "▶" : formatTime(item.duration)}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                )}

                {playlistStatus === "ready" && playlist && playlist.tracks.length === 0 && (
                    <p className="mt-2 text-[9px] text-white/30">歌单里没有可播放的歌曲</p>
                )}
            </section>
        </MenuPanel>
    );
}
