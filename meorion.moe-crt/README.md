# meorion.moe-crt

把 [uwu.cat](https://uwu.cat) 最终静态页面的 CRT 字符画背景搬到了 Next.js，并加上了网易云音乐播放：

- WebGL 字符画图片（把一张图片采样成 ASCII，再套 CRT 质感）
- CRT 屏幕弧度、扫描线、荧光粉 RGB 栅格、色散、暗角、滚动亮带、胶片颗粒
- 播放时背景缓慢旋转，暂停后停在当前角度；取景按「旋转到任意角度都不露边」的最小倍数自动放大，进入页面就是「撑满」状态
- 图片缩放固定 `100%`（自动取景已铺满，只能在此基础上继续放大；小于 `100%` 会露出黑边）
- 界面强调色从当前背景图（logo / 专辑封面）自动提取，播放按钮、进度条、发光、鼠标透镜跟着换色
- 鼠标透镜扰动、点击水滴波纹
- 居中音乐卡片：专辑封面、歌名 / 歌手、当前一句歌词、上一首 / 播放 / 下一首、可拖动进度条
- 卡片右栏的个人资料：头像、名字 / 昵称、一句话简介、所在地；状态行显示 LitterLove 的实时心率（按 BPM 搏动），头像状态点用绿 / 黄 / 红区分连接状态，心形跟随主题强调色
- 歌单随机播放：一轮内不重复，播完自动随机下一首；上一首回到上一首播放过的歌
- 首屏入场：黑幕中线亮起 → 上下帘拉开 → CRT 背景对焦 → 卡片抬起、内容错峰出现；GSAP 动态加载，`prefers-reduced-motion` 下跳过

网易云解析现在在 Next 的服务端路由 `/api/song` 里完成，**不再需要 Python 后端**：

```
浏览器  ──  /api/playlist     ──▶  Next API route（读 .env.local 的 cookie）
        ├─  /api/song?id=...  ──▶  网易云 eapi / 歌曲详情
        ├─  /api/lyric?id=... ──▶  网易云歌词接口
        └─  /api/heart        ──▶  LitterLove-server /api/state（只回心率）
```

Cookie 和 LitterLove 的地址都只存在于服务端，不会出现在浏览器 JS 或接口响应里。

## 开发

```bash
bun install
cp .env.example .env.local     # 然后填入自己的网易云 Cookie
bun run dev                    # http://127.0.0.1:3000
```

构建 / 生产：

```bash
bun run build
bun run start                  # http://127.0.0.1:3000
```

> 这个项目有 API route，部署时需要 Node 运行时，不能只导出静态 `dist/`。
> 可以用 Vercel、自己的服务器或 Docker；把 `.env.local` 里的变量（Cookie、歌单 ID、外链、LitterLove 地址）
> 配到平台的环境变量里即可。
> `next.config.ts` 里的 `allowedDevOrigins` 只是为了让 `127.0.0.1` 访问时 HMR 正常工作。

## 站点配置

所有可变配置都放在 `.env.local`（模板见 `.env.example`）：

| 变量 | 说明 |
| --- | --- |
| `PLAYLIST_ID` | 网易云歌单 ID（只在服务端读取） |
| `NEXT_PUBLIC_GITHUB_URL` | 卡片右下角的 GitHub 链接（留空则不显示） |
| `NEXT_PUBLIC_X_URL` | 卡片右下角的 X 链接（留空则不显示） |
| `NETEASE_COOKIE` / `MUSIC_U` | 网易云 Cookie（见下一节） |
| `LITTERLOVE_URL` | LitterLove-server 根地址，只用于服务端 `/api/heart`（见「心率」一节） |

`NEXT_PUBLIC_*` 会内联进浏览器包，**不要**把 Cookie 之类的秘密放进去；改完这些变量后需要重启 dev server / 重新构建。

## 个人信息

卡片右栏的头像、名字、称呼、一句话简介和所在地都在 `src/lib/site.ts` 的 `PROFILE` 里：

```ts
export const PROFILE = {
    name: "MEORION",
    handle: "@meorionel",
    bio: "喜欢的心是悬浮的魔法。",
    avatar: "/media/avatar.webp",
    location: "CN · UTC+8",
} as const;
```

头像默认是从 `public/media/logo.png` 裁出来的头部特写，想换图直接替换 `public/media/avatar.webp`（正方形、建议 192px 或更大）即可。右栏的排版会自动避开左侧的播放器，窄屏时整张卡片会改成单栏。原来的 `ONLINE` 改成实时心率，见下一节。

## 心率

状态行的 `♥ 90 BPM` 来自 [LitterLove-server](https://litterlove.meorion.moe/) 的 `/api/state`，但**浏览器不会直接连它**：

```
浏览器 ── GET /api/heart ──▶ Next API route ── GET /api/state ──▶ LitterLove-server
         { bpm, status }  ◀──  只挑 heartRate     （地址在 LITTERLOVE_URL）
```

- `LITTERLOVE_URL` **不要**加 `NEXT_PUBLIC_` 前缀，否则地址会被打包进浏览器；它只在服务端读取
- `/api/heart` 只回 `{ success: true, data: { bpm, status } }`，不转发设备、电量、定位、前台应用等字段，也不回 LitterLove 的地址
- 客户端每 30 秒轮询一次；页签隐藏时暂停，回到前台立即补一次
- `status` 是 `live / stale / offline / waiting`，头像状态点用固定状态色：`live` 绿、`stale` 黄、`offline` 红、`waiting` 灰；心形图标则跟随主题强调色
- 不是 `live` 时心率读数会变暗，但保留最后一次读数
- 心率图标的搏动周期按 `60 / BPM` 计算，`prefers-reduced-motion` 下停止搏动
- 没配置 `LITTERLOVE_URL` 或上游不可用时，接口返回明确的服务端错误，页面显示 `-- BPM`

## 入场动画

首次打开时由 `src/components/IntroOverlay.tsx` 播一段约 1.8 秒的「信号接通」动画：

- 上下两块黑帘合拢，中间亮起一条强调色光线
- 光线拉满后上下帘缓缓拉开，露出 CRT 背景；背景同时从 1.045 倍缩放回到 1
- 卡片抬起 / 淡入，播放器、进度条、身份区、外链、版权依次浮现
- 收尾补一次很轻的 CRT 闪烁，然后清掉所有内联动画属性

实现细节：

- GSAP 通过 `import("gsap")` 动态加载，不进入首屏主包；加载期间有一小段 CSS 微光线，不会整屏纯黑
- `prefers-reduced-motion: reduce` 时直接隐藏黑帘；`<noscript>` 也有对应兜底
- 黑帘即使遇到脚本加载失败，也会在 4 秒后自动淡出，不会永久挡住页面
- 想调节奏就改 `IntroOverlay.tsx` 里的 timeline；想改颜色会跟随 `--color-accent`

## 网易云 Cookie

在 `.env.local`（或 `.env`）里配置，两种写法都支持：

```bash
# 完整 Cookie，和浏览器 F12 → Network 里复制的值一致
NETEASE_COOKIE=MUSIC_U=xxxx; __csrf=yyyy; ...

# 或者只填 MUSIC_U
MUSIC_U=xxxx
```

- 变量**不要**加 `NEXT_PUBLIC_` 前缀，否则会被打包进浏览器
- `.env.local` 已被 `.gitignore` 忽略，不会提交；`.env.example` 是模板
- Cookie 失效或账号没有版权时，接口会返回明确错误（`/api/song`、`/api/lyric` 或 `/api/playlist` 的 `message`）
- 播放地址是带时效签名的，每次载入歌曲都会重新请求，不做缓存

### 接口

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

歌词（LRC 原文 + 翻译）：

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

失败时返回 `{ "success": false, "message": "..." }`，状态码为 400 / 404 / 502 / 504。
接口只接受纯数字 ID。

歌单：

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

## 歌单

歌单 ID 由 `.env.local` 的 `PLAYLIST_ID` 配置，要换歌单改环境变量即可。
页面加载后自动请求 `/api/playlist`；卡片支持：

- 播放按钮在未选歌时随机抽一首开始
- 随机播放：每轮把歌单洗牌，一轮内不重复；自然播放结束后自动随机下一首
- 「上一首」回到随机播放历史里的上一首，「下一首」从本轮洗牌队列里取

解析逻辑在 `src/server/netease.ts`，复刻自
[Netease_url](https://github.com/Suxiaoqinx/Netease_url)：

- `/api/v3/song/detail` 取歌名 / 歌手 / 专辑 / 封面（失败时退化到旧详情接口）
- eapi `/eapi/song/enhance/player/url/v1` 取播放地址
- `/api/v6/playlist/detail` + 分批 `/api/v3/song/detail` 取完整歌单列表
- AES-128-ECB + MD5 的参数加密、Cookie 合并都在服务端完成

## 结构

| 路径 | 说明 |
| --- | --- |
| `src/pages/index.tsx` | 页面：背景 + 居中音乐卡片 |
| `src/pages/api/song.ts` | 单曲解析 API（Node 运行时） |
| `src/pages/api/lyric.ts` | 歌词 API（LRC 原文 + 翻译） |
| `src/pages/api/playlist.ts` | 歌单列表 API（歌单 ID 来自 `PLAYLIST_ID`） |
| `src/server/netease.ts` | 服务端解析：eapi 加密、歌曲详情、歌词、Cookie |
| `src/components/CrtBackground.tsx` | 整块背景：字符画 + 中心压暗 + 扫描线 + 亮带 + 颗粒 |
| `src/components/CrtBackground.module.css` | 扫描线、刷新亮带、胶片颗粒 |
| `src/components/AsciiVideo.tsx` | WebGL 字符画 / CRT 渲染器（两 pass：逐格取色平滑 → 字形合成） |
| `src/components/SiteCard.tsx` | 居中音乐卡片：封面、歌名、当前歌词、播放控制、进度条 |
| `src/components/SiteCard.module.css` | 卡片颗粒、进度条滑块 |
| `src/hooks/useNeteasePlayer.ts` | 隐藏 `<audio>` 的播放状态、歌单切歌 / 自动连播、进度与歌词同步 |
| `src/hooks/useAccentColor.ts` | 背景图变化时重新提取强调色 |
| `src/lib/accent.ts` | 强调色提取：缩小采样 → 色相直方图 → 收敛饱和度 / 亮度 |
| `src/lib/netease.ts` | 浏览器侧调用 `/api/song`、`/api/lyric`、`/api/playlist`，提取歌曲 ID |
| `src/lib/lyric.ts` | LRC 解析、原文 / 翻译合并、按时间二分查找当前行 |
| `src/lib/site.ts` | 站点外链：从 `NEXT_PUBLIC_*` 环境变量读取 |
| `src/styles/globals.css` | Tailwind 入口、字体、主题变量、文档级基础样式 |
| `postcss.config.mjs` | Tailwind CSS 的 PostCSS 配置 |
| `public/media/logo.png` | 默认背景图（直接覆盖即可换图） |
| `public/fonts/` | Geist Mono 400 / 600（供字符 atlas 和界面使用） |
| `LICENSE` | 项目许可证（CC BY-SA 4.0 全文） |
| `public/fonts/OFL.txt` | Geist Mono 的 SIL Open Font License 1.1 |

## 一些实现细节

- 图片只在加载完成后上传一次纹理；旋转和缩放都在 shader 的网格采样阶段完成，
  字符格本身保持正立，鼠标透镜、水滴波纹、扫描线等效果不受影响。
- 音乐播放时背景以 `10°/s` 旋转；暂停后停在当前角度。是否旋转只影响角度，取景倍数恒定，
  所以进入页面、开始播放、暂停、切歌时画面都不会突然放大 / 缩小。
- 切歌时通过 `/api/lyric` 拉取歌词；客户端解析 LRC 时间轴，按 `currentTime`
  二分查找当前行，在播放控件上方显示一行，有翻译时用 ` · ` 接在后面。
- 缩放和旋转一样走 ref，不重建 WebGL。最终取景倍数 = 自动取景放大（按图片与屏幕的比例算出的最小倍数）× `imageScale`（始终生效，
  与是否旋转无关）；`imageScale` 小于 1 会露出黑边，所以会被按 1 处理，只能在此基础上继续放大。
- 换图（切歌换封面）不重建 WebGL：新图加载完成后原地替换纹理，下载期间继续显示上一张，
  不会先黑一帧，也不会重置旋转角度。
- 强调色同样不重建 WebGL：`accent` 走 ref，每帧只更新一个 uniform；卡片这边把提取结果写进
  `--color-accent`，Tailwind 的 `text-accent` / `bg-accent/…` 与半透明发光变量一起生效。
- 远程专辑封面用 `crossOrigin="anonymous"` 加载（网易云图床返回
  `Access-Control-Allow-Origin: *`），否则浏览器会禁止上传成 WebGL 纹理。
- 换图：直接覆盖 `public/media/logo.png`。
- 字体是本地 `@font-face` 的 Geist Mono；字体加载完成后会重建一次字形 atlas。
- `prefers-reduced-motion` 时关闭刷新亮带和背景旋转；WebGL 不可用时退化成普通 `object-fit: cover` 图片。

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

本项目在 uwu.cat 之外新增的部分（网易云音乐播放、歌词、实时心率、入场动画、资料卡片等）
同样以 CC BY-SA 4.0 提供。

### 其他内容

- **图片**：`public/media/` 下的 `logo.png`、`avatar.webp`、`favicon-64.png`、`apple-touch-icon.png`
  由 GPT 生成，用作本项目的背景、头像与图标，随项目一并按 CC BY-SA 4.0 提供。
- **字体**：Geist Mono，SIL Open Font License 1.1，全文见 [public/fonts/OFL.txt](public/fonts/OFL.txt)。
- **npm 依赖**：Next.js、React、GSAP 等各自遵循其原始许可证（多为 MIT），
  不因本项目改用 CC BY-SA 4.0 而改变；分发时请保留各自的许可证声明。
- **网易云音乐**：歌曲音频、专辑封面与歌词的版权归原权利人所有，本项目不主张任何权利，
  接口仅用于个人页面的非商业展示。

### 关于「非商业」

本项目是个人非商业项目。需要注意 CC BY-SA 4.0 **不包含「非商业」限制**，
任何人都可以按该许可证使用、修改本项目，包括用于商业目的——
因此这里不额外附加非商业条款（那会与 ShareAlike 的要求冲突）。
如果确实需要限制商业使用，只能改用 CC BY-NC-SA，但那种许可证与 uwu.cat 的 CC BY-SA 4.0 不兼容，
会违反上游的相同方式共享要求。
