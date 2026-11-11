import { useCallback, useEffect, useRef, useState } from "react";

type AudioRef = {
    current: HTMLAudioElement | null;
};

/** 两次心跳之间的最短间隔，避免把同一个鼓点误判成两拍 */
const MIN_BEAT_INTERVAL = 200;
/** 低频段 bin 数：大约覆盖 40–280Hz，主要抓底鼓和贝斯起音 */
const BASS_BINS = 6;

/**
 * 用 Web Audio 的 AnalyserNode 跟随正在播放的音频做轻量逐拍检测。
 *
 * 只观察低频能量的「起音」而不是整首曲子的 BPM：底鼓响起时触发一次 beat。
 * 暂停、切歌或没有音频源时不会触发；暂停时把 beat 归零。
 */
export function useAudioBeat(audioRef: AudioRef, enabled: boolean) {
    const [beat, setBeat] = useState(0);
    const contextRef = useRef<AudioContext | null>(null);

    /** 必须在用户手势里调用；浏览器自动播放策略会拦截异步的 resume() */
    const resume = useCallback(() => {
        const context = contextRef.current;
        if (context && context.state !== "running") {
            void context.resume().catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (!enabled) {
            setBeat(0);
            return;
        }

        resume();
    }, [enabled, resume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const AudioContextCtor = window.AudioContext
            ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextCtor) return;

        let context: AudioContext | undefined;
        let source: MediaElementAudioSourceNode | undefined;
        let analyser: AnalyserNode | undefined;

        try {
            context = new AudioContextCtor();
            source = context.createMediaElementSource(audio);
            analyser = context.createAnalyser();
            analyser.fftSize = 1024;
            analyser.smoothingTimeConstant = 0.2;
            source.connect(analyser);
            analyser.connect(context.destination);
        } catch {
            // Web Audio 初始化失败时尽量保留直接播放能力
            if (context && source) {
                try {
                    source.connect(context.destination);
                } catch {
                    // ignore
                }
            } else {
                void context?.close();
            }
            return;
        }

        contextRef.current = context;
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        const previousBins = new Uint8Array(BASS_BINS + 1);
        let frame = 0;
        let lastBeatAt = 0;
        let bassPeak = 0;

        const detect = () => {
            frame = requestAnimationFrame(detect);

            if (audio.paused || !audio.hasAttribute("src")) {
                previousBins.fill(0);
                bassPeak *= 0.98;
                return;
            }

            analyser.getByteFrequencyData(frequencyData);

            let bass = 0;
            let flux = 0;
            for (let i = 1; i <= BASS_BINS; i++) {
                bass += frequencyData[i];
                const diff = frequencyData[i] - previousBins[i];
                if (diff > 0) flux += diff;
                previousBins[i] = frequencyData[i];
            }
            bass /= BASS_BINS;

            // 低频能量本身通常是持续的；看相邻帧的正向频谱变化（起音）
            bassPeak = Math.max(bass, bassPeak * 0.997);
            const threshold = Math.max(35, bassPeak * 0.45);
            const now = performance.now();

            if (bass > threshold && flux > 24 && now - lastBeatAt > MIN_BEAT_INTERVAL) {
                lastBeatAt = now;
                setBeat((value) => value + 1);
            }
        };

        frame = requestAnimationFrame(detect);

        return () => {
            cancelAnimationFrame(frame);
            try {
                source?.disconnect();
                analyser?.disconnect();
            } catch {
                // ignore
            }
            void context?.close().catch(() => {});
            contextRef.current = null;
        };
    }, [audioRef]);

    return {beat, resume};
}
