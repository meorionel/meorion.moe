import Head from "next/head";
import { useEffect, useState } from "react";

import CrtBackground from "@/components/CrtBackground";
import IntroOverlay from "@/components/IntroOverlay";
import SiteCard from "@/components/SiteCard";
import { useAccentColor } from "@/hooks/useAccentColor";
import { useHeartRate } from "@/hooks/useHeartRate";
import { useNeteasePlayer } from "@/hooks/useNeteasePlayer";

const DEFAULT_BACKGROUND = "/media/logo.png";
const DEFAULT_ROTATION = 10;
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
    const player = useNeteasePlayer();
    const heartRate = useHeartRate();
    const track = player.track;
    const accent = useAccentColor(image);

    // 每次载入新歌（包括重载同一首）都把专辑封面换成背景
    useEffect(() => {
        if (track?.cover) setImage(track.cover);
    }, [track]);

    // 把提取到的颜色写进 CSS 变量，Tailwind 的 text-accent / bg-accent/…
    // 以及各处的半透明发光都会跟着变
    useEffect(() => {
        document.documentElement.style.setProperty("--color-accent", accent);
    }, [accent]);

    return (
        <>
            <Head>
                <title>meorion.moe — 听歌、写码、偶尔看海</title>
                <meta
                    name="description"
                    content="meorion 的个人站：CRT 字符画背景，加上网易云音乐播放器。"
                />
                <meta name="theme-color" content="#000000"/>
                <meta name="color-scheme" content="dark"/>
                <link rel="icon" type="image/png" sizes="64x64" href="/media/favicon-64.png"/>
                <link rel="apple-touch-icon" sizes="180x180" href="/media/apple-touch-icon.png"/>
            </Head>

            <IntroOverlay/>
            <CrtBackground
                src={image}
                rotationSpeed={player.playing ? DEFAULT_ROTATION : 0}
                imageScale={DEFAULT_IMAGE_SCALE}
                accent={accent}
            />
            <main className="pointer-events-none fixed inset-0 z-40 grid place-items-center p-6 max-md:p-3.5">
                <SiteCard
                    track={player.track}
                    status={player.status}
                    error={player.error}
                    playing={player.playing}
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
            </main>
        </>
    );
}
