# meorion.moe-crt

把 [uwu.cat](https://uwu.cat) 最终静态页面的 CRT 字符画背景搬到 Next.js，再配一张居中的音乐卡片：
背景是 WebGL 实时渲染的字符画 + CRT 质感，卡片里播放网易云歌单，界面的强调色从当前背景图里提取。
卡片下方还有一块 `PEER LINK` 友链面板，沿用同一套 CRT 玻璃质感。

## 功能

- **字符画背景**：图片被采样成字符网格，再叠加 CRT 屏幕弧度、扫描线、荧光粉 RGB 栅格、色散、暗角与滚动亮带
- **鼠标交互**：透镜扰动（悬停处字符乱码并染色）、点击水滴波纹（最多同时 8 个，可叠加）
- **播放时旋转**：音乐播放时背景以 `10°/s` 缓慢旋转，暂停后停在当前角度；取景倍数恒定，不会突然放大
- **背景跟随歌曲**：载入歌曲后专辑封面自动替换成背景，换图不重建 WebGL、不黑帧
- **网易云播放**：服务端解析歌单与播放地址，随机播放一轮不重复，支持上一首 / 下一首 / 拖动进度
- **歌词**：按 `currentTime` 二分查找当前行，显示原文，有翻译时在第二行显示
- **实时心率**：状态行显示 LitterLove 的 BPM，心形图标跟随音乐低频鼓点搏动，头像状态点用颜色区分连接状态
- **友链**：卡片下方的 `PEER LINK` 面板默认收起，展开后是双列终端清单，hover 弹出和心率同款的终端 Tooltip
- **强调色提取**：从当前背景图里取主色，驱动按钮、进度条、发光、透镜和入场动画
- **入场动画**：约 1.8 秒的「信号接通」效果（黑幕 → 中线亮起 → 上下帘拉开 → 背景对焦 → 卡片错峰浮现）
- **降级**：WebGL 不可用时退回普通图片；`prefers-reduced-motion` 下关闭旋转、亮带、入场和搏动

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Next.js 16.4（Pages Router）、React 19、TypeScript 5 |
| 样式 | Tailwind CSS 4（`@tailwindcss/postcss`）+ CSS Modules |
| 渲染 | WebGL 1（原生 API，无 three.js）、Web Audio API（AnalyserNode） |
| 动画 | GSAP 3（`import("gsap")` 动态加载，不进首屏主包） |
| 包管理 | Bun 1.3 |

## 快速开始

```bash
bun install
cp .env.example .env.local     # 填入网易云 Cookie、歌单 ID 等
bun run dev                    # http://127.0.0.1:3000
```

构建与生产：

```bash
bun run build
bun run start
```

> 项目有 API route，部署时需要 Node 运行时，不能静态导出成 `dist/`。
> `next.config.ts` 里的 `allowedDevOrigins` 只是为了让 `127.0.0.1` 访问时 HMR 正常工作。

## 环境变量

全部配置都在 `.env.local`（模板见 `.env.example`）：

| 变量 | 说明 |
| --- | --- |
| `PLAYLIST_ID` | 网易云歌单 ID，只在服务端读取 |
| `NETEASE_COOKIE` / `MUSIC_U` | 网易云 Cookie，只在服务端读取 |
| `LITTERLOVE_URL` | LitterLove-server 根地址（不带 `/api/state`），只在服务端读取 |
| `NEXT_PUBLIC_GITHUB_URL` | 右栏 GitHub 外链，留空则不显示 |
| `NEXT_PUBLIC_X_URL` | 右栏 X 外链，留空则不显示 |

`NEXT_PUBLIC_*` 会在构建时内联进浏览器包，**不要**把 Cookie 之类的秘密放进去；改完需要重启 dev server 或重新构建。
`.env.local` 已被 `.gitignore` 忽略，不会提交。

## 接口

四个路由都是 `GET`、`Cache-Control: no-store`，失败统一返回 `{ "success": false, "message": "..." }`，
状态码为 400 / 404 / 405 / 500 / 502 / 504。

```http
GET /api/song?id=66842
```

```json
{
  "success": true,
  "data": {
    "id": "66842",
    "name": "十年",
    "ar_name": "陈奕迅",
    "al_name": "黑白灰",
    "pic": "https://p1.music.126.net/....jpg",
    "url": "https://m802.music.126.net/....mp3",
    "level": "standard",
    "size": 481115
  }
}
```

`id` 只接受 1–20 位纯数字。播放地址是带时效签名的，每次载入都重新请求，不做缓存。

```http
GET /api/lyric?id=66842
```

```json
{
  "success": true,
  "data": {
    "lyric": "[00:14.69]music so good even a devil may cry\n...",
    "translated": "[00:14.69]音乐品味如此好甚至恶魔也要哭泣\n..."
  }
}
```

```http
GET /api/playlist
```

```json
{
  "success": true,
  "data": {
    "id": "13246943556",
    "name": "……",
    "cover": "https://p1.music.126.net/....jpg",
    "count": 122,
    "tracks": [
      {
        "id": "3451570714",
        "name": "Cherry Candy",
        "artist": "Lunak",
        "album": "Cherry Candy",
        "cover": "https://p3.music.126.net/....jpg",
        "duration": 141
      }
    ]
  }
}
```

歌单 ID 来自服务端的 `PLAYLIST_ID`；播放地址仍然按需走 `/api/song`，避免一次返回一堆会过期的 URL。

```http
GET /api/heart
```

```json
{ "success": true, "data": { "bpm": 90, "status": "live" } }
```

只返回心率的 `bpm` / `status`，上游的设备、电量、定位等字段不会下发。

## 播放器

`src/hooks/useNeteasePlayer.ts` 管理一个**不在 React 树里**的隐藏 `<audio>`，避免进度更新触发整页重渲染。

- 页面挂载时请求 `/api/playlist`（StrictMode 下只请求一次）
- 未选歌时点播放：从歌单随机抽一首开场，剩下的进入本轮待播队列
- 随机播放：一轮内不重复，一轮播完重新洗牌并避开刚播完的那首
- 「上一首」回到随机播放历史，「下一首」从本轮队列里取
- 自然播放结束自动随机下一首
- 浏览器拦截自动播放时保持暂停，等用户点播放
- 切歌时先显示列表里的信息、再请求播放地址，避免旧音频继续播放

歌词在切歌时立刻清空并重新拉取 `/api/lyric`；解析支持 `[mm:ss]`、`[mm:ss.xx]`、`[mm:ss.xxx]`、`[mm:ss:xx]`
和一行多个时间标签，`[ti:]` 之类元数据会被忽略。原文与翻译按毫秒时间点合并，
查找用二分：开头返回第一句，结尾保持最后一句。

解析逻辑在 `src/server/netease.ts`，复刻自 [Netease_url](https://github.com/Suxiaoqinx/Netease_url)：

- `/api/v3/song/detail` 取歌名 / 歌手 / 专辑 / 封面，失败时退化到旧版 `/api/song/detail`
- eapi `/eapi/song/enhance/player/url/v1` 取播放地址，参数做 AES-128-ECB 加密并附 MD5 摘要
- `/api/v6/playlist/detail` 拿 `trackIds`，再按 100 首一批调详情补全歌单
- Cookie 支持完整串或单个 `MUSIC_U`，与 `os / appver / deviceId` 等默认值合并后只发往网易云
- 超时：单曲 / 歌词 20 秒，歌单 25 秒

## 心率

状态行的 `♥ 90 BPM` 来自 [LitterLove-server](https://litterlove.meorion.moe/) 的 `/api/state`，但浏览器不会直接连它：

```
浏览器 ── GET /api/heart ──▶ Next API route ── GET /api/state ──▶ LitterLove-server
         { bpm, status }  ◀──  只挑 heartRate     （地址在 LITTERLOVE_URL）
```

- 客户端每 30 秒轮询一次；页签隐藏时暂停，回到前台立即补一次
- `status` 为 `live / stale / offline / waiting`；头像状态点用固定色：绿 / 黄 / 红 / 灰
- 心形图标跟随主题强调色，搏动由音乐的**低频鼓点**触发（Web Audio 频谱起音检测），不是按 BPM 计算
- 不是 `live` 时读数变暗，但保留最后一次值；没配置或上游不可用时显示 `-- BPM`
- 悬停心形会显示一条说明气泡；气泡由 `src/components/Tooltip.tsx` 提供，友链也复用同一套

## 友链

主卡片下方是一块独立的 `PEER LINK` 面板，数据在 `src/lib/friends.ts`，与 Win98 版
`win98-style/src/friends.ts` 的 `FRIENDS` 对应：顺序、名字、头像和链接保持一致，只把超长域名缩短成可读的写法。

- 默认收起，只留一行标题栏；点右侧「展开 +」才拉下列表，按钮带 `aria-expanded` / `aria-controls`
- 展开动画用 `grid-template-rows: 0fr → 1fr` 过渡；收起时列表加 `inert`，里面的链接不会被 Tab 到
- 动画期间先裁掉溢出内容、结束后再放开，折起来时列表不会提前露出来，展开后 Tooltip 也不会被裁
- 双列终端清单：序号 + 头像 + 名字 + TUI 点线 + 域名；hover / 键盘聚焦时整行亮起强调色
- hover 弹出的 Tooltip 和心率说明完全相同，显示完整名字和 URL；窄屏没有 hover，直接隐藏气泡
- 头像默认灰度并叠一层扫描线，hover 才恢复彩色；远程头像加载失败时退回名字首字母
- 最后一行是 `交换友链`，直接 `mailto:me@meorion.moe`
- 窄屏（< 768px）隐藏域名、点线和箭头、保留双列；360px 以下连序号一起隐藏，保证名字放得下
- `lassksy` 的头像从 Win98 版的 `public/friend/lassksy.webp` 复制到 `public/media/friends/`，
  其余头像仍然直接引用各自主站的地址

主内容现在由 `main` 自己滚动：卡片 + 友链在矮屏（比如 600px 高的手机）上会超出视口，
桌面仍然居中且不出现滚动条。

## 背景渲染

`src/components/AsciiVideo.tsx` 用两个 pass 完成渲染：

1. **取色 pass**：在「每格一个像素」的小网格上采样图片，和上一帧做指数平滑，压掉噪点和阈值附近闪烁
2. **合成 pass**：按亮度选字符，从字形 atlas 取字形，叠加 CRT 效果

细节：

- 字形 atlas 分两行：上行锐利字形，下行预模糊的荧光光晕；RGB 三通道错开采样得到色散边
- 字符格 `cellSize` 默认 7 CSS px，高度 ×1.6，密度表 ` .:-~=+*xoeO#%&@`，帧率上限 30fps，DPR 最多 2
- 扫描线按 3 CSS px 一条，与页面上的 CSS 扫描线对齐；另有荧光粉 RGB 栅格、暗角、滚动亮带
- 屏幕弧度用桶形畸变；窄屏（<768px）或竖屏时关闭弧度，直接平铺
- 旋转与缩放都在网格采样阶段完成，字符本身保持正立
- 取景倍数取「旋转到任意角度都不露黑边」的闭式最小值，再乘 `imageScale`（小于 1 会被按 1 处理）
- 换图只替换纹理，不重建 shader / 上下文，也不重置旋转角度；超过 GPU 纹理上限的图会先等比缩小
- 远程封面用 `crossOrigin="anonymous"` 加载，否则无法上传成 WebGL 纹理
- 字体加载完成后重建一次 atlas，避免用回退字体渲染字符

## 强调色

`src/lib/accent.ts` 从图片里取一个适合深色界面的颜色：缩到 64×64 采样 → 跳过透明 / 过暗 / 过亮 / 灰像素 →
按色相分 24 个箱子、以「饱和度² × 不透明度」加权 → 取最大箱 ±1 箱加权平均 → 把饱和度收进 0.55–0.95、
亮度收进 0.56–0.7。提取失败（CORS 污染、纯灰图）时用兜底色 `#ceff1c`。

结果写进 `--color-accent`，Tailwind 的 `text-accent` / `bg-accent/…` 和 `--accent-tint` / `--accent-glow`
等半透明变量会一起变化。头像的柔光则单独从头像图里提取，不跟页面主题色走。

## 入场动画

`src/components/IntroOverlay.tsx` 用 GSAP timeline 播一段约 1.76 秒的动画：

- 中线亮起 → 上下黑帘拉开（同时闪一下）→ CRT 背景从 1.045 倍对焦到 1
- 卡片抬起 / 淡入，`[data-intro-item]` 标记的内容以 0.08s 间隔错峰出现
- 收尾补一次很轻的闪烁，结束后清掉所有内联 transform / opacity，避免影响 fixed 布局

兜底：GSAP 动态加载失败时直接隐藏黑帘；CSS 里有 4 秒后自动淡出的 `intro-failsafe`；
`<noscript>` 里也有一条样式直接隐藏黑帘；`prefers-reduced-motion` 下整段跳过。

## 目录结构

| 路径 | 说明 |
| --- | --- |
| `src/pages/index.tsx` | 页面：背景 + 居中卡片 + 友链，串起播放器、心率、强调色 |
| `src/pages/_document.tsx` | `lang="zh-CN"`、`<noscript>` 兜底 |
| `src/pages/api/song.ts` | 单曲信息 + 播放地址 |
| `src/pages/api/lyric.ts` | LRC 原文 + 翻译 |
| `src/pages/api/playlist.ts` | 歌单列表（ID 来自 `PLAYLIST_ID`） |
| `src/pages/api/heart.ts` | 心率（只回 `bpm` / `status`） |
| `src/server/netease.ts` | eapi 加密、歌曲 / 歌单 / 歌词解析、Cookie 合并 |
| `src/server/heart.ts` | 请求 LitterLove 并裁剪字段、校验 BPM 范围 |
| `src/components/AsciiVideo.tsx` | WebGL 字符画 / CRT 渲染器 |
| `src/components/CrtBackground.tsx` | 背景叠层：字符画 → 中心压暗 → 扫描线 → 亮带 → 颗粒 |
| `src/components/CrtBackground.module.css` | 扫描线、刷新亮带、胶片颗粒 |
| `src/components/IntroOverlay.tsx` | 首屏入场动画 |
| `src/components/SiteCard.tsx` | 居中卡片，2:1 分栏 |
| `src/components/SiteCardPlayer.tsx` | 左栏：封面、歌名、歌词、控制、进度条 |
| `src/components/SiteCardProfile.tsx` | 右栏：资料、心率、外链、版权 |
| `src/components/ProfileAvatar.tsx` | 头像裁切、柔光、状态点 |
| `src/components/SiteCard.module.css` | 卡片颗粒、进度条、心率触发区、头像光晕 |
| `src/components/Tooltip.tsx` | 心率 / 友链共用的终端 Tooltip |
| `src/components/Tooltip.module.css` | 气泡、头部信号点、扫描线、箭头与对齐 |
| `src/components/FriendLinks.tsx` | 卡片下方的 `PEER LINK` 友链面板（默认折叠） |
| `src/components/FriendLinks.module.css` | 友链面板颗粒、信号灯、点线、hover 状态 |
| `src/hooks/useNeteasePlayer.ts` | 播放状态、随机切歌、进度与歌词同步 |
| `src/hooks/useAudioBeat.ts` | 低频起音检测，驱动心形搏动 |
| `src/hooks/useAccentColor.ts` | 背景图变化时重新提取强调色 |
| `src/hooks/useHeartRate.ts` | 轮询 `/api/heart`，页签隐藏时暂停 |
| `src/lib/netease.ts` | 浏览器侧调用三个接口、提取歌曲 ID |
| `src/lib/lyric.ts` | LRC 解析、原文 / 翻译合并、二分查找 |
| `src/lib/accent.ts` | 强调色提取 |
| `src/lib/heart.ts` | 心率类型与状态校验（前后端共用） |
| `src/lib/site.ts` | `PROFILE` 与 `SOCIAL_LINKS` |
| `src/lib/friends.ts` | 友链清单（与 Win98 版一致） |
| `src/lib/time.ts` | 秒 → `m:ss` |
| `src/styles/globals.css` | Tailwind 入口、字体、`@theme` 主题变量、文档级样式 |
| `public/media/logo.png` | 默认背景图（直接覆盖即可换图） |
| `public/media/avatar.webp` | 头像 |
| `public/media/friends/lassksy.webp` | 友链头像的本地副本（原图来自 Win98 版） |
| `public/fonts/` | Geist Mono 400 / 600，供字符 atlas 与界面使用 |
| `LICENSE` | 项目许可证（CC BY-SA 4.0 全文） |
| `public/LICENSE.txt` | 部署站点可直接访问的许可副本 |
| `public/fonts/OFL.txt` | Geist Mono 的 SIL Open Font License 1.1 |

## 个人信息

卡片右栏的头像、名字、称呼、简介和所在地在 `src/lib/site.ts` 的 `PROFILE` 里：

```ts
export const PROFILE = {
    name: "MEORION",
    handle: "@meorionel",
    bio: "喜欢的心是悬浮的魔法。",
    avatar: "/media/avatar.webp",
    location: "CN · UTC+8",
} as const;
```

换图直接替换 `public/media/avatar.webp`（正方形，建议 192px 以上）。

## 部署

需要 Node 运行时（API route 依赖 `node:crypto`），把 `.env.local` 里的变量配到平台的环境变量即可。
Vercel、自己的服务器或 Docker 都可以。

## 许可

本项目整体以 **CC BY-SA 4.0**（Creative Commons 署名-相同方式共享 4.0 国际）提供，
全文见 [LICENSE](LICENSE)，许可证主页：<https://creativecommons.org/licenses/by-sa/4.0/>

© 2026 Meorion。本作品按 CC BY-SA 4.0「按原样」提供，不附带任何明示或默示的担保。

### 改编来源

字符画 / CRT 背景移植自 **uwu.cat**：

- 作品：uwu.cat — <https://uwu.cat>
- 源码：<https://github.com/CtrlcvsNya/uwu.cat>
- 作者：Ctrlcvs
- 许可证：CC BY-SA 4.0（与本项目相同）

涉及的改编文件与具体改动：

- `src/components/AsciiVideo.tsx`：WebGL 字符画 + CRT shader。去掉了入场扫描 / 开机动画，
  只保留最终页面背景；鼠标透镜、点击水滴波纹、扫描线、弧度、暗角等最终页效果保留。
  输入源由视频改为静态图片，并在网格采样阶段加入整体旋转。
- `src/components/CrtBackground.tsx`、`src/components/CrtBackground.module.css`、
  `src/styles/globals.css`：背景的叠加层（中心压暗、CSS 扫描线、刷新亮带、胶片颗粒）与全屏舞台。

本项目在 uwu.cat 之外新增的部分（网易云音乐播放、歌词、实时心率、入场动画、资料卡片、友链面板等）
同样以 CC BY-SA 4.0 提供。

### 其他内容

- **图片**：`public/media/` 下的 `logo.png`、`avatar.webp`、`favicon-64.png`、`apple-touch-icon.png`
  由 GPT 生成，用作本项目的背景、头像与图标，随项目一并按 CC BY-SA 4.0 提供。
- **友链头像**：`public/media/friends/lassksy.webp` 复制自本仓库的 Win98 版站点；
  其余头像直接引用各友链站点的地址，版权归各自站点所有，本项目不主张任何权利。
- **字体**：Geist Mono，SIL Open Font License 1.1，全文见 [public/fonts/OFL.txt](public/fonts/OFL.txt)。
- **npm 依赖**：Next.js、React、GSAP 等各自遵循其原始许可证（多为 MIT），
  不因本项目改用 CC BY-SA 4.0 而改变；分发时请保留各自的许可证声明。
- **网易云音乐**：歌曲音频、专辑封面与歌词的版权归原权利人所有，本项目不主张任何权利，
  接口仅用于个人页面的非商业展示。
