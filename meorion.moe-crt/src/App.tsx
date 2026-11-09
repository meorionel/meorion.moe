import { useEffect, useRef, useState } from "react";

import BackgroundMenu, { type BackgroundPreset } from "./components/BackgroundMenu";
import CrtBackground from "./components/CrtBackground";

const PRESETS: BackgroundPreset[] = [
    {id: "avatar", label: "头像", src: "/media/avatar.png"},
    {id: "cat", label: "猫咪", src: "/media/background.jpg"},
];

const DEFAULT_ROTATION = 10;

/**
 * 最终静态页面的背景，右下角留一个半透明菜单控制旋转和图片。
 * 页面本身留空：内容层以后直接叠在背景上面即可（背景不拦截指针事件）。
 */
export default function App() {
    const [image, setImage] = useState(PRESETS[0].src);
    const [rotationSpeed, setRotationSpeed] = useState(DEFAULT_ROTATION);
    const customUrl = useRef<string | null>(null);

    // 本地上传产生的 object URL 需要手动回收
    useEffect(() => () => {
        if (customUrl.current) URL.revokeObjectURL(customUrl.current);
    }, []);

    const selectPreset = (src: string) => {
        if (customUrl.current) {
            URL.revokeObjectURL(customUrl.current);
            customUrl.current = null;
        }
        setImage(src);
    };

    const uploadImage = (file: File) => {
        if (customUrl.current) URL.revokeObjectURL(customUrl.current);
        const url = URL.createObjectURL(file);
        customUrl.current = url;
        setImage(url);
    };

    return (
        <>
            <CrtBackground src={image} rotationSpeed={rotationSpeed}/>
            <BackgroundMenu
                rotationSpeed={rotationSpeed}
                onRotationSpeedChange={setRotationSpeed}
                image={image}
                presets={PRESETS}
                onImageSelect={selectPreset}
                onImageUpload={uploadImage}
            />
        </>
    );
}
