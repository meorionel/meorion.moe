---
title: 解决 nuxt.js 安装失败
pubDate: 2024-12-26T18:11:32+08:00
updatedDate: 2025-12-12T10:16:32+08:00
---

想玩玩 nuxt.js, 但是安装的时候发现报错了.

![终端报错](https://image.meorion.moe/image/nuxt_setup_error/1.webp)

经典的网络错误.

### 方法 1

这个需要修改你的npm镜像源, 我用的淘宝的镜像源会报错, 需要修改为官方的镜像源.

```bash
# 查看镜像源
npm config get registry

# 设置为官方源
npm config set registry https://registry.npmjs.org/

# 设置为淘宝源
npm config set registry https://registry.npmmirror.com/
```

注意! 因为官方源很慢, 所以需要在安装向导进行到询问你使用的包管理器时就要开一个新的终端把镜像源换回去.

```bash
# 在这一步切换
❯ Which package manager would you like to use?
○ npm
● pnpm (current)
○ yarn
○ bun
○ deno
```

### 方法 2

这下面是最有效的解决方法, 但是会错过 nuxt 的安装向导.

解决方法也很简单, 直接将报错内容中的 URL 复制到浏览器, 如果能够看到如下结构并且含有 `tar` 的键值, 恭喜你, 你可以接着往下看了, 如果没有, 或许你得考虑看看其他人的解决方案了.

![json](https://image.meorion.moe/image/nuxt_setup_error/2.webp)

将 `tar` 的值复制到地址栏打开, 浏览器就会下载一个压缩包, 直接将里面的文件夹解压出来, 这个文件夹就是 nuxt.js 的初始demo了, 把它复制到你需要的地方然后就能够正常使用了.

```
https://codeload.github.com/nuxt/starter/tar.gz/refs/heads/v3
```

![压缩包](https://image.meorion.moe/image/nuxt_setup_error/3.webp)
