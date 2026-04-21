---
title: pm2无法自动读取环境变量
pubDate: 2025-01-01T15:42:14+08:00
---

今天把写的ai应用部署的时候出现了很奇怪的问题。

我在服务器测试时用`nodemon`启动后端，前端正常访问，用pm2挂起之后再打开网站刷新却出现了CORS报错，让我一度以为我又写错了什么。

![1.webp](https://image.meorion.moe/image/pm2_env/1.webp)

打开终端看了一眼，好家伙，重启一百多次。

把进程暂停了又用`nodemon`跑了一次就正常了，显然是pm2的问题了。

![2.webp](https://image.meorion.moe/image/pm2_env/2.webp)

用`pm2 logs`看了一眼日志，发现原来是程序没有读取到环境变量，环境变量里面有`KEY`，因为初始化没有读取到`KEY`导致程序出错。

![3.webp](https://image.meorion.moe/image/pm2_env/3.webp)

问了一下GPT，GPT说因为pm2不会自动读取环境变量，需要显式指定。

在启动项目的时候显式指定一下需要读取的环境变量就解决了。

```bash
pm2 start ./server.js --env .env
```
