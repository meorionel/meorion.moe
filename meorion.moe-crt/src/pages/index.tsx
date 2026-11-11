import Head from "next/head";
import { useEffect, useState } from "react";

import CrtBackground from "@/components/CrtBackground";
import SiteCard from "@/components/SiteCard";
import { useAccentColor } from "@/hooks/useAccentColor";
import { useNeteasePlayer } from "@/hooks/useNeteasePlayer";

const DEFAULT_BACKGROUND = "/media/logo.png";
const DEFAULT_ROTATION = 10;
const DEFAULT_IMAGE_SCALE = 0.6;

/**
 * 最终静态页面：CRT 字符画背景 + 居中音乐卡片。
 * 播放时背景缓慢旋转，暂停后停在当前角度；载入歌曲后自动把专辑封面换成背景。
 * 界面的强调色从当前背景图里提取（logo / 专辑封面），换图时跟着换。
 */
export default function Home() {
    const [image, setImage] = useState(DEFAULT_BACKGROUND);
    const player = useNeteasePlayer();
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
                <title>meorion.moe</title>
                <meta name="theme-color" content="#000000"/>
                <meta name="color-scheme" content="dark"/>
                <link rel="icon" type="image/png" sizes="64x64" href="/media/favicon-64.png"/>
                <link rel="apple-touch-icon" sizes="180x180" href="/media/apple-touch-icon.png"/>
            </Head>

            <CrtBackground
                src={image}
                rotationSpeed={player.playing ? DEFAULT_ROTATION : 0}
                imageScale={DEFAULT_IMAGE_SCALE}
                accent={accent}
            />
            <main className="pointer-events-none fixed inset-0 z-40 grid place-items-center p-6 max-sm:p-3.5">
                <SiteCard
                    track={player.track}
                    status={player.status}
                    error={player.error}
                    playing={player.playing}
                    currentTime={player.currentTime}
                    duration={player.duration}
                    playlist={player.playlist}
                    playlistStatus={player.playlistStatus}
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
