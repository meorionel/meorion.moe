import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

import BootScreen from "@/components/BootScreen";
import CrtBackground from "@/components/CrtBackground";
import FriendLinks from "@/components/FriendLinks";
import IntroOverlay from "@/components/IntroOverlay";
import SiteCard from "@/components/SiteCard";
import { useAccentColor } from "@/hooks/useAccentColor";
import { useHeartRate } from "@/hooks/useHeartRate";
import { useNeteasePlayer } from "@/hooks/useNeteasePlayer";

const DEFAULT_BACKGROUND = "/media/logo.png";
const DEFAULT_ROTATION = 10;
// 启动页至少停留一小会儿，避免缓存命中时 logo / 进度条只闪一帧
const BOOT_MIN_MS = 700;
// 背景大图最多等 6 秒；低速网络下不为了它无限卡住启动页
const BOOT_ASSET_TIMEOUT_MS = 6000;
// 最迟 30 秒放行；歌单请求自身有 25 秒超时，这里只是最后的安全绳
const BOOT_SAFETY_TIMEOUT_MS = 30000;
// 自动取景已经铺满视口（旋转到任意角度都不会露黑边），
// 这里只在此基础上继续放大，不要再小于 1。
const DEFAULT_IMAGE_SCALE = 1;

/**
 * 最终静态页面：CRT 字符画背景 + 居中音乐卡片。
 * 播放时背景缓慢旋转，暂停后停在当前角度；载入歌曲后自动把专辑封面换成背景。
 * 界面的强调色从当前背景图里提取（logo / 专辑封面），换图时跟着换。
 */
export default function Home() {
    const [image, setImage] = useState(DEFAULT_BACKGROUND);
    const [phase, setPhase] = useState<"boot" | "intro">("boot");
    const [minBootElapsed, setMinBootElapsed] = useState(false);
    const [bootAssetsReady, setBootAssetsReady] = useState(false);
    const [introBundleReady, setIntroBundleReady] = useState(false);
    const [bootTimedOut, setBootTimedOut] = useState(false);
    const player = useNeteasePlayer();
    const {heartRate, loaded: heartLoaded} = useHeartRate();
    const track = player.track;
    const accent = useAccentColor(image);

    const playlistSettled = player.playlistStatus !== "loading";

    // 每次载入新歌（包括重载同一首）都把专辑封面换成背景
    useEffect(() => {
        if (track?.cover) setImage(track.cover);
    }, [track]);

    // 把提取到的颜色写进 CSS 变量，Tailwind 的 text-accent / bg-accent/…
    // 以及各处的半透明发光都会跟着变
    useEffect(() => {
        document.documentElement.style.setProperty("--color-accent", accent);
    }, [accent]);

    // 启动页至少露个面，避免一切都在缓存里时进度条还没看清就消失
    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const timer = window.setTimeout(() => setMinBootElapsed(true), reduce ? 250 : BOOT_MIN_MS);
        return () => window.clearTimeout(timer);
    }, []);

    // 背景图 / 字体属于「首屏观感」的一部分：优先等背景大图，但最多 6 秒，
    // 不因为一张 1MB 的图把启动页无限按住。
    useEffect(() => {
        let cancelled = false;

        const waitForImage = (src: string, timeoutMs: number) =>
            new Promise<void>((resolve) => {
                let settled = false;
                let timer = 0;
                const finish = () => {
                    if (settled) return;
                    settled = true;
                    window.clearTimeout(timer);
                    resolve();
                };

                timer = window.setTimeout(finish, timeoutMs);
                const image = new Image();
                image.onload = () => {
                    void image.decode().catch(() => {}).finally(finish);
                };
                image.onerror = finish;
                image.src = src;
                if (image.complete) finish();
            });

        const fonts = document.fonts?.ready ?? Promise.resolve();
        void Promise.all([
            waitForImage(DEFAULT_BACKGROUND, BOOT_ASSET_TIMEOUT_MS),
            fonts,
        ]).then(
            () => {
                if (!cancelled) setBootAssetsReady(true);
            },
            () => {
                // 字体接口异常也不要把启动页永久卡住
                if (!cancelled) setBootAssetsReady(true);
            },
        );

        return () => {
            cancelled = true;
        };
    }, []);

    // 启动页的安全绳：即使某个请求意外卡住，也不会永远看不到页面
    useEffect(() => {
        const timer = window.setTimeout(() => setBootTimedOut(true), BOOT_SAFETY_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
    }, []);

    // 启动页显示期间并行预加载 GSAP：这样启动页结束时入场动画的代码已经在了，
    // 不会出现启动页消失后黑屏等 chunk，甚至等到 4 秒兜底而跳过动画。
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setIntroBundleReady(true);
            return;
        }

        let cancelled = false;
        void import("gsap")
            .catch(() => {})
            .then(() => {
                if (!cancelled) setIntroBundleReady(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const bootReady =
        bootTimedOut ||
        (minBootElapsed && bootAssetsReady && introBundleReady && playlistSettled && heartLoaded);
    const finishBoot = useCallback(() => setPhase("intro"), []);

    return (
        <>
            <Head>
                <title>meorion.moe — 喜欢的心是悬浮的魔法</title>
                <meta
                    name="description"
                    content="(=ↀωↀ=)✧ฅ"
                />
                <meta name="theme-color" content="#000000"/>
                <meta name="color-scheme" content="dark"/>
                <link rel="icon" type="image/png" sizes="64x64" href="/media/favicon-64.png"/>
                <link rel="apple-touch-icon" sizes="180x180" href="/media/apple-touch-icon.png"/>
            </Head>

            {phase === "boot" ? (
                <BootScreen ready={bootReady} onDone={finishBoot}/>
            ) : (
                <IntroOverlay/>
            )}
            <CrtBackground
                src={image}
                rotationSpeed={player.playing ? DEFAULT_ROTATION : 0}
                imageScale={DEFAULT_IMAGE_SCALE}
                accent={accent}
            />
            <main className="pointer-events-auto fixed inset-0 z-40 overflow-y-auto overscroll-contain">
                <div className="flex min-h-full flex-col items-center justify-center gap-3 p-6 max-md:touch-pan-y max-md:gap-2.5 max-md:p-3.5">
                    <SiteCard
                        track={player.track}
                        status={player.status}
                        error={player.error}
                        playing={player.playing}
                        beat={player.beat}
                        currentTime={player.currentTime}
                        duration={player.duration}
                        playlist={player.playlist}
                        playlistStatus={player.playlistStatus}
                        heartRate={heartRate}
                        lyricLine={player.lyricLine}
                        lyricStatus={player.lyricStatus}
                        onToggle={player.toggle}
                        onSeek={player.seek}
                        onNext={player.next}
                        onPrev={player.prev}
                    />
                    <FriendLinks/>
                </div>
            </main>
        </>
    );
}
