import { useCallback, useEffect, useRef, useState } from "react";

import { useAudioBeat } from "./useAudioBeat";

import { findLyricLine, parseLyric, type LyricLine, type LyricStatus } from "../lib/lyric";
import {
    extractSongId,
    fetchLyric,
    fetchPlaylist,
    fetchTrack,
    type PlayerStatus,
    type Playlist,
    type PlaylistStatus,
    type Track,
} from "../lib/netease";

const DEFAULT_VOLUME = 0.7;

/** 把 0..length-1 洗牌，可排除若干索引（随机播放用） */
function shuffledIndices(length: number, exclude: number[] = []) {
    const indices: number[] = [];
    for (let i = 0; i < length; i++) {
        if (!exclude.includes(i)) indices.push(i);
    }
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
}

/**
 * 管理一个隐藏的 <audio>：歌单、随机切歌、播放 / 暂停、进度同步。
 * 音频不进入 React 树，避免每次进度更新都触发整页重渲染。
 */
export function useNeteasePlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const requestRef = useRef(0);
    const suppressAudioErrorRef = useRef(false);
    const autoNextRef = useRef<() => void>(() => {});
    const playlistRequestedRef = useRef(false);
    // 随机播放：currentIndexRef 让切歌逻辑始终拿到最新的索引（避免连续点击时闭包过期）
    const currentIndexRef = useRef(-1);
    const queueRef = useRef<number[]>([]);   // 本轮洗牌后还没播的索引
    const historyRef = useRef<number[]>([]); // 已经播放过的索引（上一首用）

    const [track, setTrack] = useState<Track | null>(null);
    const [status, setStatus] = useState<PlayerStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [playlistStatus, setPlaylistStatus] = useState<PlaylistStatus>("loading");
    const [playlistError, setPlaylistError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
    const [lyricStatus, setLyricStatus] = useState<LyricStatus>("idle");

    useEffect(() => {
        const audio = new Audio();
        audio.preload = "metadata";
        audio.volume = DEFAULT_VOLUME;
        // 走 Web Audio 分析需要 CORS；网易云 CDN 已返回 Access-Control-Allow-Origin: *
        audio.crossOrigin = "anonymous";
        audioRef.current = audio;

        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onTime = () => {
            setCurrentTime(audio.currentTime);
            if (Number.isFinite(audio.duration)) setDuration(audio.duration);
        };
        const onMeta = () => {
            if (Number.isFinite(audio.duration)) setDuration(audio.duration);
        };
        const onEnded = () => {
            setPlaying(false);
            setCurrentTime(Number.isFinite(audio.duration) ? audio.duration : 0);
            // 只有歌单里的歌才随机续播；手动加载的单曲播完就停
            if (currentIndexRef.current >= 0) autoNextRef.current();
        };
        const onError = () => {
            if (suppressAudioErrorRef.current) return;
            setPlaying(false);
            setError("音频加载失败，可能受版权或地区限制");
        };

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("loadedmetadata", onMeta);
        audio.addEventListener("durationchange", onMeta);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);

        return () => {
            requestRef.current += 1;
            suppressAudioErrorRef.current = true;
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener("loadedmetadata", onMeta);
            audio.removeEventListener("durationchange", onMeta);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("error", onError);
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
            audioRef.current = null;
        };
    }, []);

    const {beat, resume: resumeAudioBeat} = useAudioBeat(audioRef, playing);

    /** 清掉上一首，避免请求新地址期间旧音频继续播放；忽略清空 src 产生的 error */
    const prepareAudio = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        suppressAudioErrorRef.current = true;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        setCurrentTime(0);
        setDuration(0);
        setPlaying(false);
    }, []);

    const loadPlaylist = useCallback(async () => {
        setPlaylistStatus("loading");
        setPlaylistError(null);
        try {
            const next = await fetchPlaylist();
            setPlaylist(next);
            setPlaylistStatus("ready");
        } catch (e) {
            setPlaylistStatus("error");
            setPlaylistError(e instanceof Error ? e.message : "歌单载入失败");
        }
    }, []);

    // 页面挂载时载入写死的歌单；StrictMode 下只请求一次
    useEffect(() => {
        if (playlistRequestedRef.current) return;
        playlistRequestedRef.current = true;
        void loadPlaylist();
    }, [loadPlaylist]);

    const reloadPlaylist = useCallback(() => {
        void loadPlaylist();
    }, [loadPlaylist]);

    // 歌单（重新）载入后重新洗牌；当前正在播的歌不受影响
    useEffect(() => {
        queueRef.current = [];
        historyRef.current = [];
    }, [playlist]);

    // 歌词只跟当前歌曲绑定；切歌时立刻清空，避免上一首的歌词残留
    useEffect(() => {
        const id = track?.id;
        if (!id) {
            setLyricLines([]);
            setLyricStatus("idle");
            return;
        }

        let cancelled = false;
        setLyricLines([]);
        setLyricStatus("loading");

        fetchLyric(id)
            .then((data) => {
                if (cancelled) return;
                setLyricLines(parseLyric(data.lyric, data.translated));
                setLyricStatus("ready");
            })
            .catch(() => {
                if (cancelled) return;
                setLyricLines([]);
                setLyricStatus("error");
            });

        return () => {
            cancelled = true;
        };
    }, [track?.id]);

    const playIndex = useCallback(
        async (index: number) => {
            const item = playlist?.tracks[index];
            if (!item) return;

            resumeAudioBeat();
            const seq = ++requestRef.current;
            setCurrentIndex(index);
            currentIndexRef.current = index;
            setStatus("loading");
            setError(null);
            // 先把列表里的信息显示出来 / 换成封面，再请求播放地址
            setTrack({
                id: item.id,
                name: item.name,
                artist: item.artist,
                album: item.album,
                cover: item.cover,
                audio: "",
            });
            prepareAudio();

            try {
                const next = await fetchTrack(item.id);
                if (seq !== requestRef.current) return;

                const audio = audioRef.current;
                if (!audio) return;

                setTrack(next);
                setStatus("ready");
                suppressAudioErrorRef.current = false;
                audio.src = next.audio;
                audio.load();

                try {
                    await audio.play();
                } catch {
                    // 浏览器可能拦截自动播放：保持暂停，等用户点播放
                    setPlaying(false);
                }
            } catch (e) {
                if (seq !== requestRef.current) return;
                setStatus("error");
                setError(e instanceof Error ? e.message : "解析失败");
            }
        },
        [playlist, prepareAudio, resumeAudioBeat],
    );

    /** 手动输入单曲 ID / 链接（不进入歌单循环） */
    const load = useCallback(
        async (input: string) => {
            const songId = extractSongId(input);
            if (!songId) {
                setStatus("error");
                setError("请输入歌曲 ID 或网易云链接");
                return;
            }

            resumeAudioBeat();
            const seq = ++requestRef.current;
            setCurrentIndex(-1);
            currentIndexRef.current = -1;
            setStatus("loading");
            setError(null);
            setTrack(null);
            prepareAudio();

            try {
                const next = await fetchTrack(songId);
                if (seq !== requestRef.current) return;

                const audio = audioRef.current;
                if (!audio) return;

                setTrack(next);
                setStatus("ready");
                suppressAudioErrorRef.current = false;
                audio.src = next.audio;
                audio.load();

                try {
                    await audio.play();
                } catch {
                    setPlaying(false);
                }
            } catch (e) {
                if (seq !== requestRef.current) return;
                setStatus("error");
                setError(e instanceof Error ? e.message : "解析失败");
            }
        },
        [prepareAudio, resumeAudioBeat],
    );

    const toggle = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        resumeAudioBeat();

        // 还没有选歌时，播放按钮直接开始歌单：随机抽一首开场，剩下的继续随机
        if (!audio.hasAttribute("src")) {
            const tracks = playlist?.tracks;
            if (tracks && tracks.length > 0) {
                if (currentIndexRef.current >= 0) {
                    void playIndex(currentIndexRef.current);
                } else {
                    const order = shuffledIndices(tracks.length);
                    const first = order.pop();
                    if (first === undefined) return;
                    queueRef.current = order;
                    void playIndex(first);
                }
            }
            return;
        }

        if (audio.paused) {
            setError(null);
            if (audio.ended || (Number.isFinite(audio.duration) && audio.currentTime >= audio.duration - 0.05)) {
                audio.currentTime = 0;
            }
            audio.play().catch(() => setError("播放失败，请再试一次"));
        } else {
            audio.pause();
        }
    }, [playlist, playIndex, resumeAudioBeat]);

    const seek = useCallback((time: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = time;
        setCurrentTime(time);
    }, []);

    const selectTrack = useCallback(
        (index: number) => {
            if (index === currentIndexRef.current) {
                if (status === "loading") return;
                if (track?.audio) {
                    toggle();
                    return;
                }
            } else {
                // 手动选中一首：记入历史，并从本轮待播里移除，避免随后又立刻随机到
                if (currentIndexRef.current >= 0) historyRef.current.push(currentIndexRef.current);
                queueRef.current = queueRef.current.filter((i) => i !== index);
            }
            void playIndex(index);
        },
        [status, track, toggle, playIndex],
    );

    /** 随机下一首：一轮内不重复，一轮播完再重新洗牌，并避开刚播完的这首 */
    const next = useCallback(() => {
        const tracks = playlist?.tracks;
        if (!tracks || tracks.length === 0) return;

        const current = currentIndexRef.current;
        if (queueRef.current.length === 0) {
            queueRef.current = shuffledIndices(tracks.length, current >= 0 ? [current] : []);
        }
        const target = queueRef.current.pop() ?? current;
        if (target < 0) return;
        if (current >= 0 && current !== target) historyRef.current.push(current);
        void playIndex(target);
    }, [playlist, playIndex]);

    /** 上一首：回到随机播放历史里的上一首；没有历史时随机挑一首不同的 */
    const prev = useCallback(() => {
        const tracks = playlist?.tracks;
        if (!tracks || tracks.length === 0) return;

        const current = currentIndexRef.current;
        const target = historyRef.current.pop();
        if (target !== undefined) {
            // 退回的那首之后还可以再随机到，所以把当前这首放回队尾
            if (current >= 0 && current !== target) queueRef.current.push(current);
            void playIndex(target);
            return;
        }

        const pool = shuffledIndices(tracks.length, current >= 0 ? [current] : []);
        void playIndex(pool[0] ?? 0);
    }, [playlist, playIndex]);

    // 自然播完后自动随机下一首；手动输入的单曲不自动进入歌单
    useEffect(() => {
        autoNextRef.current = next;
    }, [next]);

    const lyricLine = findLyricLine(lyricLines, currentTime);

    return {
        track,
        status,
        error,
        playing,
        beat,
        currentTime,
        duration,
        load,
        toggle,
        seek,
        playlist,
        playlistStatus,
        playlistError,
        currentIndex,
        selectTrack,
        next,
        prev,
        reloadPlaylist,
        lyricLine,
        lyricStatus,
    };
}
