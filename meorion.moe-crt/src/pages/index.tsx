import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";

import BackgroundMenu, { type BackgroundPreset } from "@/components/BackgroundMenu";
import CrtBackground from "@/components/CrtBackground";
import MusicMenu from "@/components/MusicMenu";
import SiteCard from "@/components/SiteCard";
import { useNeteasePlayer } from "@/hooks/useNeteasePlayer";

const PRESETS: BackgroundPreset[] = [
    {id: "avatar", label: "头像", src: "/media/avatar.png"},
    {id: "cat", label: "猫咪", src: "/media/background.jpg"},
];

const DEFAULT_ROTATION = 10;
const DEFAULT_IMAGE_SCALE = 0.6;

// 暂时隐藏右下角所有菜单，先看居中卡片的版式；要恢复改成 true
const SHOW_MENUS = false;

/**
 * 最终静态页面的背景，右下角两个半透明菜单：
 *   - 音乐：输入网易云歌曲 ID 播放，专辑封面自动成为背景，带进度条
 *   - 背景：控制旋转速度、图片缩放，切换预设图 / 上传本地图片
 * 页面本身留空：内容层以后直接叠在背景上面即可（背景不拦截指针事件）。
 */
export default function Home() {
    const [image, setImage] = useState(PRESETS[0].src);
    const [rotationSpeed, setRotationSpeed] = useState(DEFAULT_ROTATION);
    const [imageScale, setImageScale] = useState(DEFAULT_IMAGE_SCALE);
    const customUrl = useRef<string | null>(null);

    const player = useNeteasePlayer();
    const track = player.track;

    // 本地上传产生的 object URL 需要手动回收
    useEffect(() => () => {
        if (customUrl.current) URL.revokeObjectURL(customUrl.current);
    }, []);

    const setBackground = useCallback((src: string) => {
        if (customUrl.current && customUrl.current !== src) {
            URL.revokeObjectURL(customUrl.current);
            customUrl.current = null;
        }
        setImage(src);
    }, []);

    // 每次载入新歌（包括重载同一首）都把专辑封面换成背景
    useEffect(() => {
        if (track?.cover) setBackground(track.cover);
    }, [track, setBackground]);

    const selectPreset = (src: string) => setBackground(src);

    const uploadImage = (file: File) => {
        if (customUrl.current) URL.revokeObjectURL(customUrl.current);
        const url = URL.createObjectURL(file);
        customUrl.current = url;
        setImage(url);
    };

    return (
        <>
            <Head>
                <title>meorion.moe</title>
                <meta name="theme-color" content="#000000"/>
                <meta name="color-scheme" content="dark"/>
                <link rel="icon" type="image/png" sizes="64x64" href="/media/favicon-64.png"/>
                <link rel="apple-touch-icon" sizes="180x180" href="/media/apple-touch-icon.png"/>
            </Head>

            {/* 背景默认一直旋转；速度滑块设为 0 才暂停 */}
            <CrtBackground
                src={image}
                rotationSpeed={rotationSpeed}
                imageScale={imageScale}
            />
            <main className="stage">
                <SiteCard
                    track={player.track}
                    status={player.status}
                    error={player.error}
                    playing={player.playing}
                    currentTime={player.currentTime}
                    duration={player.duration}
                    playlist={player.playlist}
                    playlistStatus={player.playlistStatus}
                    onToggle={player.toggle}
                    onSeek={player.seek}
                    onNext={player.next}
                    onPrev={player.prev}
                />
            </main>

            {SHOW_MENUS && (
                <div className="bg-dock" data-bg-ui="">
                    <MusicMenu
                        track={player.track}
                        status={player.status}
                        error={player.error}
                        playing={player.playing}
                        currentTime={player.currentTime}
                        duration={player.duration}
                        onLoad={player.load}
                        onToggle={player.toggle}
                        onSeek={player.seek}
                        playlist={player.playlist}
                        playlistStatus={player.playlistStatus}
                        playlistError={player.playlistError}
                        currentIndex={player.currentIndex}
                        onSelectTrack={player.selectTrack}
                        onReloadPlaylist={player.reloadPlaylist}
                        onNext={player.next}
                        onPrev={player.prev}
                    />
                    <BackgroundMenu
                        rotationSpeed={rotationSpeed}
                        onRotationSpeedChange={setRotationSpeed}
                        image={image}
                        imageLabel={track?.cover === image ? "专辑封面" : undefined}
                        imageScale={imageScale}
                        onImageScaleChange={setImageScale}
                        presets={PRESETS}
                        onImageSelect={selectPreset}
                        onImageUpload={uploadImage}
                    />
                </div>
            )}
        </>
    );
}
