# meorion.moe-crt

把 [uwu.cat](https://uwu.cat) 最终静态页面的背景搬到了这里：

- WebGL 字符画视频（实时把视频采样成 ASCII，再套 CRT 质感）
- CRT 屏幕弧度、扫描线、荧光粉 RGB 栅格、色散、暗角、滚动亮带、胶片颗粒
- 鼠标透镜扰动、点击水滴波纹
- **没有**入场扫描、swarm 光标开场、电视开机等所有进入动画；挂载后直接就是最终画面

## 开发

```bash
npm install
npm run dev        # http://127.0.0.1:5173
```

构建 / 预览：

```bash
npm run build      # 类型检查 + 输出到 dist/
npm run preview    # http://127.0.0.1:4173
```

## 结构

| 路径 | 说明 |
| --- | --- |
| `src/App.tsx` | 目前页面只有背景本身 |
| `src/components/CrtBackground.tsx` | 整块背景：字符画 + 中心压暗 + 扫描线 + 亮带 + 颗粒 |
| `src/components/AsciiVideo.tsx` | WebGL 字符画 / CRT 渲染器（两 pass：逐格取色平滑 → 字形合成） |
| `src/styles/global.css` | 背景舞台与叠加层样式 |
| `public/media/kitten-540p.mp4` | 背景视频 |
| `LICENSES/` | 来源与许可证 |

## 在背景上放内容

`CrtBackground` 是 `position: fixed; inset: 0; z-index: 0; pointer-events: none` 的，
内容层只要建立自己的层叠上下文并放在 z-index 0 之上即可，例如：

```tsx
import CrtBackground from "./components/CrtBackground";

export default function App() {
    return (
        <>
            <CrtBackground/>
            <main style={{position: "relative", zIndex: 10, minHeight: "100dvh"}}>
                {/* 页面内容 */}
            </main>
        </>
    );
}
```

组件参数：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `src` | `/media/kitten-540p.mp4` | 视频地址 |
| `cellSize` | `7` | 字符宽度（CSS px），高度自动 ×1.6 |
| `charset` | `" .:-~=+*xoeO#%&@"` | 从暗到亮的字符密度表 |
| `accent` | `#ceff1c` | 鼠标透镜 / 水波的强调色 |
| `maxFps` | `30` | 渲染帧率上限 |

## 一些实现细节

- 字号 / 字体来自 CSS 变量 `--font-ascii`（默认 Geist Mono）；字体加载完成后会重建一次字形 atlas。
- 标签页切到后台时视频暂停；`prefers-reduced-motion` 时关闭刷新亮带的动画。
- 窄屏 / 竖屏会关掉 CRT 弧度，避免手机上画面变形。
- WebGL 不可用时退化成普通的 `object-fit: cover` 视频。
- 视频是 H.264 MP4；部署到静态主机时最好让服务器支持 Range 请求（Safari / iOS 需要）。
  本地的 `vite preview` 已支持。

## 许可

字符画 / CRT 效果改编自 uwu.cat（Ctrlcvs，CC BY-SA 4.0），背景视频来自 Pixabay。
详见 [LICENSES/uwu-cat.md](LICENSES/uwu-cat.md) 与 [LICENSES/CC-BY-SA-4.0.txt](LICENSES/CC-BY-SA-4.0.txt)。
