import { useCallback, useEffect, useRef, useState } from "react";

import BackgroundMenu, { type BackgroundPreset } from "./components/BackgroundMenu";
import CrtBackground from "./components/CrtBackground";
import MusicMenu from "./components/MusicMenu";
import { useNeteasePlayer } from "./hooks/useNeteasePlayer";

const PRESETS: BackgroundPreset[] = [
    {id: "avatar", label: "头像", src: "/media/avatar.png"},
    {id: "cat", label: "猫咪", src: "/media/background.jpg"},
];

const DEFAULT_ROTATION = 10;

/**
 * 最终静态页面的背景，右下角两个半透明菜单：
 *   - 音乐：输入网易云歌曲 ID 播放，专辑封面自动成为背景，带进度条
 *   - 背景：控制旋转速度、切换预设图 / 上传本地图片
 * 页面本身留空：内容层以后直接叠在背景上面即可（背景不拦截指针事件）。
 */
export default function App() {
    const [image, setImage] = useState(PRESETS[0].src);
    const [rotationSpeed, setRotationSpeed] = useState(DEFAULT_ROTATION);
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
            <CrtBackground src={image} rotationSpeed={rotationSpeed}/>
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
                />
                <BackgroundMenu
                    rotationSpeed={rotationSpeed}
                    onRotationSpeedChange={setRotationSpeed}
                    image={image}
                    imageLabel={track?.cover === image ? "专辑封面" : undefined}
                    presets={PRESETS}
                    onImageSelect={selectPreset}
                    onImageUpload={uploadImage}
                />
            </div>
        </>
    );
}
