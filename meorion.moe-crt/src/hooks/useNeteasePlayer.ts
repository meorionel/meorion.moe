import { useCallback, useEffect, useRef, useState } from "react";

import { extractSongId, fetchTrack, type PlayerStatus, type Track } from "../lib/netease";

const DEFAULT_VOLUME = 0.7;

/**
 * 管理一个隐藏的 <audio>：解析歌曲、播放 / 暂停、同步进度。
 * 音频不进入 React 树，避免每次进度更新都触发整页重渲染。
 */
export function useNeteasePlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const requestRef = useRef(0);

    const [track, setTrack] = useState<Track | null>(null);
    const [status, setStatus] = useState<PlayerStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

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
        };
        const onError = () => {
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

    const load = useCallback(async (input: string) => {
        const songId = extractSongId(input);
        if (!songId) {
            setStatus("error");
            setError("请输入歌曲 ID 或网易云链接");
            return;
        }

        const seq = ++requestRef.current;
        setStatus("loading");
        setError(null);

        try {
            const next = await fetchTrack(songId);
            if (seq !== requestRef.current) return;

            const audio = audioRef.current;
            if (!audio) return;

            setTrack(next);
            setCurrentTime(0);
            setDuration(0);
            setStatus("ready");

            audio.src = next.audio;
            audio.load();
            try {
                await audio.play();
            } catch {
                // 浏览器可能拦截自动播放：保持暂停，让用户点播放按钮
                setPlaying(false);
            }
        } catch (e) {
            if (seq !== requestRef.current) return;
            setStatus("error");
            setError(e instanceof Error ? e.message : "解析失败");
        }
    }, []);

    const toggle = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !audio.src) return;
        if (audio.paused) {
            setError(null);
            if (audio.ended || (Number.isFinite(audio.duration) && audio.currentTime >= audio.duration - 0.05)) {
                audio.currentTime = 0;
            }
            audio.play().catch(() => setError("播放失败，请再试一次"));
        } else {
            audio.pause();
        }
    }, []);

    const seek = useCallback((time: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = time;
        setCurrentTime(time);
    }, []);

    return {track, status, error, playing, currentTime, duration, load, toggle, seek};
}
