# Attribution / 来源说明

这个目录里的「字符画 + CRT」背景移植自 **uwu.cat**：

- 项目：uwu.cat — https://uwu.cat
- 源码：https://github.com/CtrlcvsNya/uwu.cat
- 作者：Ctrlcvs
- 许可证：CC BY-SA 4.0（见同目录 `CC-BY-SA-4.0.txt`，https://creativecommons.org/licenses/by-sa/4.0/）

具体改编的部分：

- `src/components/AsciiVideo.tsx`：WebGL 字符画 + CRT shader，去掉了入场扫描 / 开机动画，
  只保留最终页面背景；保留了鼠标透镜、点击水滴波纹、扫描线、弧度、暗角等最终页效果。
  输入源已从视频改成静态图片（渲染与交互逻辑未改动）。
- `src/components/CrtBackground.tsx`、`src/styles/global.css`：背景的叠加层（中心压暗、
  CSS 扫描线、刷新亮带、胶片颗粒）与全屏舞台。

以上改编同样以 **CC BY-SA 4.0** 提供。

## 背景图片

`public/media/background.jpg` 是从 uwu.cat 使用的视频里截取的一帧（约第 3 秒），原片：

- “Kitten, Game, Pets” by **MixailMixail**，来自 Pixabay
- https://pixabay.com/videos/kitten-game-pets-4216/
- 许可证：Pixabay Content License（https://pixabay.com/service/license-summary/）

这张图片 **不在** CC BY-SA 4.0 的范围内，使用时请遵守 Pixabay 的内容许可。
