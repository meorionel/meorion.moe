import { useCallback, useEffect, useRef, useState } from "react";

import {
    extractSongId,
    fetchPlaylist,
    fetchTrack,
    type PlayerStatus,
    type Playlist,
    type PlaylistStatus,
    type Track,
} from "../lib/netease";

const DEFAULT_VOLUME = 0.7;

/**
 * 管理一个隐藏的 <audio>：歌单、切歌、播放 / 暂停、进度同步。
 * 音频不进入 React 树，避免每次进度更新都触发整页重渲染。
 */
export function useNeteasePlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const requestRef = useRef(0);
    const suppressAudioErrorRef = useRef(false);
    const autoNextRef = useRef<() => void>(() => {});
    const playlistRequestedRef = useRef(false);

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

    useEffect(() => {
        const audio = new Audio();
        audio.preload = "metadata";
        audio.volume = DEFAULT_VOLUME;
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
            autoNextRef.current();
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

    const playIndex = useCallback(
        async (index: number) => {
            const item = playlist?.tracks[index];
            if (!item) return;

            const seq = ++requestRef.current;
            setCurrentIndex(index);
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
        [playlist, prepareAudio],
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

            const seq = ++requestRef.current;
            setCurrentIndex(-1);
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
        [prepareAudio],
    );

    const toggle = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // 还没有选歌时，播放按钮直接开始歌单（当前首或第一首）
        if (!audio.hasAttribute("src")) {
            if (playlist && playlist.tracks.length > 0) {
                void playIndex(currentIndex >= 0 ? currentIndex : 0);
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
    }, [playlist, currentIndex, playIndex]);

    const seek = useCallback((time: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = time;
        setCurrentTime(time);
    }, []);

    const selectTrack = useCallback(
        (index: number) => {
            if (index === currentIndex) {
                if (status === "loading") return;
                if (track?.audio) {
                    toggle();
                    return;
                }
            }
            void playIndex(index);
        },
        [currentIndex, status, track, toggle, playIndex],
    );

    const next = useCallback(() => {
        if (!playlist || playlist.tracks.length === 0) return;
        const target = currentIndex < 0 ? 0 : (currentIndex + 1) % playlist.tracks.length;
        void playIndex(target);
    }, [playlist, currentIndex, playIndex]);

    const prev = useCallback(() => {
        if (!playlist || playlist.tracks.length === 0) return;
        const target =
            currentIndex < 0
                ? 0
                : (currentIndex - 1 + playlist.tracks.length) % playlist.tracks.length;
        void playIndex(target);
    }, [playlist, currentIndex, playIndex]);

    // 自然播完后自动下一首；手动输入的单曲不自动进入歌单
    useEffect(() => {
        autoNextRef.current = () => {
            if (!playlist || playlist.tracks.length === 0 || currentIndex < 0) return;
            void playIndex((currentIndex + 1) % playlist.tracks.length);
        };
    }, [playlist, currentIndex, playIndex]);

    return {
        track,
        status,
        error,
        playing,
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
    };
}
