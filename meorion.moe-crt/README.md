# meorion.moe-crt

把 [uwu.cat](https://uwu.cat) 最终静态页面的背景搬到了这里：

- WebGL 字符画图片（把一张图片采样成 ASCII，再套 CRT 质感）
- CRT 屏幕弧度、扫描线、荧光粉 RGB 栅格、色散、暗角、滚动亮带、胶片颗粒
- 背景图片在音乐播放时缓慢旋转（速度可调，旋转时自动放大取景避免四角露空），支持 100%–250% 缩放
- 鼠标透镜扰动、点击水滴波纹
- 右下角两个半透明菜单：
  - **音乐**：输入网易云歌曲 ID / 链接即可播放，专辑封面自动成为背景，带可拖动的进度条
  - **背景**：实时调旋转速度与图片缩放、暂停 / 继续、切换预设图或上传本地图片
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
| `src/App.tsx` | 页面：背景 + 右下角两个控制菜单，切歌时把专辑封面同步为背景 |
| `src/components/CrtBackground.tsx` | 整块背景：字符画 + 中心压暗 + 扫描线 + 亮带 + 颗粒 |
| `src/components/AsciiVideo.tsx` | WebGL 字符画 / CRT 渲染器（两 pass：逐格取色平滑 → 字形合成） |
| `src/components/MusicMenu.tsx` | 音乐面板：歌曲 ID 输入、播放 / 暂停、进度条 |
| `src/components/BackgroundMenu.tsx` | 背景面板：旋转速度、图片缩放、预设图 / 本地上传 |
| `src/hooks/useNeteasePlayer.ts` | 隐藏 `<audio>` 的播放状态、进度同步 |
| `src/lib/netease.ts` | 调用 Netease_url 解析歌曲地址 / 封面 |
| `src/styles/global.css` | 背景舞台、叠加层、右下角菜单样式 |
| `public/media/avatar.png` | 当前默认背景图片（直接覆盖它就能换图，不用改代码） |
| `public/media/background.jpg` | 另一张备选背景图（猫咪） |
| `LICENSES/` | 来源与许可证 |

## 音乐

歌曲解析走 [Netease_url](https://github.com/Suxiaoqinx/Netease_url) 的
`/song?id=...&type=json` 接口（一次返回歌名、歌手、专辑、封面和带时效签名的播放地址）。
默认连接 `http://127.0.0.1:5000`，先在本地把它跑起来：

```bash
git clone https://github.com/Suxiaoqinx/Netease_url.git
cd Netease_url
pip install -r requirements.txt
# 在 cookie.txt 里填入可用的网易云 Cookie（需要能取到播放地址的账号）
python main.py
```

服务不在默认地址时，复制 `.env.example` 为 `.env.local` 并修改：

```bash
VITE_NETEASE_API=https://your-api.example.com
```

> `VITE_` 变量在构建时写死，改完要重新 `npm run build`；部署到 HTTPS 站点时解析服务也必须是 HTTPS（或由同域反向代理）。

使用：在「音乐」里输入歌曲 ID（也支持 `https://music.163.com/song?id=...`）后回车 ——
自动播放、专辑封面替换背景、进度条实时更新且可拖动跳转。没有版权 / 会员权限的歌曲会
直接显示失败原因；音频本身不会上传或经过本站，只有歌曲 ID 会发给解析服务。

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

## 右下角菜单

两个面板都放在 `.bg-dock` 里（`position: fixed`，右下角，`z-index: 50`），音乐在上、背景在下，
不参与背景的层叠 / 混色：

**音乐**

- 输入歌曲 ID / 链接，回车或点「载入」；解析成功自动播放
- 播放 / 暂停、当前时间 / 总时长、可拖动进度条
- 专辑封面自动替换背景图，背景菜单的「图片」会显示为「专辑封面」
- 解析失败、服务未启动、版权限制都会在面板里显示原因

**背景**

- **旋转**：滑块 `0–30°/s`，实时生效且不会重建 WebGL；旁边的按钮暂停 / 恢复上一次的速度。
  只有音乐真正在播放时才会旋转，未载入 / 暂停 / 播放结束时画面会停在当前角度
- **图片**：头像、猫咪两张预设图；「上传」从本地选图（用 `URL.createObjectURL`，不会发到服务器）
- **缩放**：`100%–250%`，在 `cover` 取景的基础上继续放大裁切；与旋转的自动取景放大相乘
- 只想要背景、不需要菜单时，不渲染 `<MusicMenu/>` / `<BackgroundMenu/>` 即可

组件参数：

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `src` | `/media/avatar.png` | 图片地址 |
| `cellSize` | `7` | 字符宽度（CSS px），高度自动 ×1.6 |
| `charset` | `" .:-~=+*xoeO#%&@"` | 从暗到亮的字符密度表 |
| `accent` | `#ceff1c` | 鼠标透镜 / 水波的强调色 |
| `maxFps` | `30` | 渲染帧率上限 |
| `rotationSpeed` | `10` | 图片旋转速度（度/秒）；`0` 暂停 |
| `imageScale` | `1` | 图片额外缩放（`1`–`2.5`），与旋转取景放大相乘 |

## 一些实现细节

- 图片只在加载完成后上传一次纹理；旋转在 shader 的网格采样阶段完成，字符格本身保持正立，
  鼠标透镜、水滴波纹、扫描线、刷新亮带、颗粒等效果不受影响。
- 旋转到任意角度都需要图片覆盖整个屏幕，所以取景会自动放大到刚好不露四角（16:10 屏幕约 1.9×）。
  速度设为 `0` 时会停在当前角度；如果从未转过，取景仍是原来的 `cover`。
- 缩放和旋转一样只改网格采样阶段，字符格保持正立；最终取景倍数 = 旋转自动放大 × `imageScale`，
  所以开着旋转时滑块会继续在当前裁切上放大，而不是重置回 100%。
- 换图：直接覆盖 `public/media/avatar.png`（或改 `src`，或用右下角菜单上传）即可，
  图片按 `cover` 裁切，建议用 16:9 或更宽的构图。
- 远程封面用 `crossOrigin="anonymous"` 加载（网易云图床返回 `Access-Control-Allow-Origin: *`），
  否则浏览器会禁止把它上传成 WebGL 纹理；音频地址里的 `http://` 会统一提升成 `https://`。
- 字号 / 字体来自 CSS 变量 `--font-ascii`（默认 Geist Mono）；字体加载完成后会重建一次字形 atlas。
- `prefers-reduced-motion` 时关闭刷新亮带和背景旋转。
- 窄屏 / 竖屏会关掉 CRT 弧度，避免手机上画面变形。
- WebGL 不可用时退化成普通的 `object-fit: cover` 图片。

## 许可

字符画 / CRT 效果改编自 uwu.cat（Ctrlcvs，CC BY-SA 4.0），背景图片来自 Pixabay。
详见 [LICENSES/uwu-cat.md](LICENSES/uwu-cat.md) 与 [LICENSES/CC-BY-SA-4.0.txt](LICENSES/CC-BY-SA-4.0.txt)。
