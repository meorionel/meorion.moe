# meorion.moe-crt

把 [uwu.cat](https://uwu.cat) 最终静态页面的 CRT 字符画背景搬到了 Next.js，并加上了网易云音乐播放：

- WebGL 字符画图片（把一张图片采样成 ASCII，再套 CRT 质感）
- CRT 屏幕弧度、扫描线、荧光粉 RGB 栅格、色散、暗角、滚动亮带、胶片颗粒
- 背景图片默认缓慢旋转（速度可调，旋转时自动放大取景避免四角露空）
- 图片缩放 `25%–250%`，默认 `60%`（刚好看到完整专辑封面）：小于 `100%` 时缩小，图片范围之外显示黑色
- 鼠标透镜扰动、点击水滴波纹
- 右下角两个半透明菜单：
  - **音乐**：写死歌单 `719039399` + 手动单曲；列表切歌、上一首 / 下一首、自动连播，专辑封面自动成为背景，带可拖动进度条
  - **背景**：旋转速度、图片缩放、暂停 / 继续、预设图 / 本地上传
- **没有**入场扫描、swarm 光标开场、电视开机等所有进入动画；挂载后直接就是最终画面

网易云解析现在在 Next 的服务端路由 `/api/song` 里完成，**不再需要 Python 后端**：

```
浏览器  ──  /api/playlist     ──▶  Next API route（读 .env.local 的 cookie）
        └─  /api/song?id=...  ──▶  网易云 eapi / 歌曲详情 / 歌单详情
```

Cookie 只存在于服务端，不会出现在浏览器 JS 或接口响应里。

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
> 可以用 Vercel、自己的服务器或 Docker；把 `NETEASE_COOKIE` 配到平台的环境变量里即可。
> `next.config.ts` 里的 `allowedDevOrigins` 只是为了让 `127.0.0.1` 访问时 HMR 正常工作。

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
- Cookie 失效或账号没有版权时，接口会返回明确错误（`/api/song` 或 `/api/playlist` 的 `message`）
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

失败时返回 `{ "success": false, "message": "..." }`，状态码为 400 / 404 / 502 / 504。
只接受纯数字 ID（客户端会先把网易云链接里的 ID 提取出来）。

歌单：

```http
GET /api/playlist
```

```json
{
  "success": true,
  "data": {
    "id": "719039399",
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

歌单 ID 写死在 `src/server/netease.ts` 的 `PLAYLIST_ID = "719039399"`，要换歌单改这一行即可。
页面加载后自动请求 `/api/playlist`；歌曲列表在音乐菜单底部，可以：

- 点击任意一首切换并播放
- 播放按钮在未选歌时直接从第一首开始
- 自然播放结束后自动下一首，也可以用上一首 / 下一首按钮
- 手动输入的单曲不进入歌单循环，播完不会自动接歌单

解析逻辑在 `src/server/netease.ts`，复刻自
[Netease_url](https://github.com/Suxiaoqinx/Netease_url)：

- `/api/v3/song/detail` 取歌名 / 歌手 / 专辑 / 封面（失败时退化到旧详情接口）
- eapi `/eapi/song/enhance/player/url/v1` 取播放地址
- `/api/v6/playlist/detail` + 分批 `/api/v3/song/detail` 取完整歌单列表
- AES-128-ECB + MD5 的参数加密、Cookie 合并都在服务端完成

## 结构

| 路径 | 说明 |
| --- | --- |
| `src/pages/index.tsx` | 页面：背景 + 右下角两个控制菜单 |
| `src/pages/api/song.ts` | 单曲解析 API（Node 运行时） |
| `src/pages/api/playlist.ts` | 歌单列表 API（写死 719039399） |
| `src/server/netease.ts` | 服务端解析：eapi 加密、歌曲详情、Cookie |
| `src/components/CrtBackground.tsx` | 整块背景：字符画 + 中心压暗 + 扫描线 + 亮带 + 颗粒 |
| `src/components/AsciiVideo.tsx` | WebGL 字符画 / CRT 渲染器（两 pass：逐格取色平滑 → 字形合成） |
| `src/components/MusicMenu.tsx` | 音乐面板：单曲输入、歌单列表、播放 / 暂停、进度条 |
| `src/components/BackgroundMenu.tsx` | 背景面板：旋转、缩放、预设图 / 本地上传 |
| `src/hooks/useNeteasePlayer.ts` | 隐藏 `<audio>` 的播放状态、歌单切歌 / 自动连播、进度同步 |
| `src/lib/netease.ts` | 浏览器侧调用 `/api/song`、`/api/playlist`，提取歌曲 ID |
| `src/styles/globals.css` | 背景舞台、叠加层、菜单样式 |
| `public/media/avatar.png` | 默认背景图（直接覆盖即可换图） |
| `public/media/background.jpg` | 备选背景图（猫咪） |
| `public/fonts/` | Geist Mono 400 / 600（供字符 atlas 和界面使用） |
| `LICENSES/` | 来源与许可证 |

## 一些实现细节

- 图片只在加载完成后上传一次纹理；旋转和缩放都在 shader 的网格采样阶段完成，
  字符格本身保持正立，鼠标透镜、水滴波纹、扫描线等效果不受影响。
- 页面加载后背景默认旋转；把速度设为 `0` 会停在当前角度。
- 缩放和旋转一样走 ref，不重建 WebGL。最终取景倍数 = 旋转自动放大 × `imageScale`；
  `imageScale < 1` 时 UV 会超出图片范围，shader 对这些位置直接返回黑色。
- 远程专辑封面用 `crossOrigin="anonymous"` 加载（网易云图床返回
  `Access-Control-Allow-Origin: *`），否则浏览器会禁止上传成 WebGL 纹理。
- 换图：直接覆盖 `public/media/avatar.png`，或用右下角菜单上传 / 切换。
- 字体是本地 `@font-face` 的 Geist Mono；字体加载完成后会重建一次字形 atlas。
- `prefers-reduced-motion` 时关闭刷新亮带和背景旋转；WebGL 不可用时退化成普通 `object-fit: cover` 图片。

## 许可

字符画 / CRT 效果改编自 uwu.cat（Ctrlcvs，CC BY-SA 4.0），背景图片来自 Pixabay。
Geist Mono 使用 SIL Open Font License 1.1。
详见 [LICENSES/uwu-cat.md](LICENSES/uwu-cat.md)、[LICENSES/CC-BY-SA-4.0.txt](LICENSES/CC-BY-SA-4.0.txt)
与 [LICENSES/GeistMono-OFL.txt](LICENSES/GeistMono-OFL.txt)。
