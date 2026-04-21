---
title: CloudFlare 代理导致错误的 Content-Type
pubDate: 2025-05-27T23:24:25+08:00
---

今天给[主页](s22y.moe)翻新了一下, 上传到服务器打开浏览器发现页面不对, css 样式没有被加载.

打开开发者工具, 发现 css 文件已经 200 了, 但是样式没有加载出来.

检查发现响应头的 Content-Type 居然是 `text/plain`, 正常应该是 `text/css`.

![1](https://image.meorion.moe/image/cloudflareProxyTextPlain/24381748353530_.pic.jpg)

本来以为是 nginx 的问题, 按照谷歌上的方法, 搞了半天 `mime.types` 还是不行.

没办法, 问了一下 ai, 把配置和 log 都发给 ai, ai说我的 log 里有 CloudFlare 的 ip, 可能是 CloudFlare 导致的.

我直接把 CloudFlare 的代理关了, 等了一会, 再请求发现 Content-Type 正常了, 所以问题很明显了, 是 CloudFlare 的锅.

又问了下 ai, ai 让我添加一条规则绕过缓存, 配置了一下果然好了.

![3](https://image.meorion.moe/image/cloudflareProxyTextPlain/3.webp)

![3](https://image.meorion.moe/image/cloudflareProxyTextPlain/2.png)

---

### 原理

当 CloudFlare 开启代理后, 会自动缓存一些静态文件, 例如css, js.

这样虽然可以减轻源服务器的压力, 但是它可能会基于 MIME 嗅探结果修改响应头, 导致出现上面的问题.

当我们设置了这条规则后, CloudFlare 不会缓存 `assets` 目录下的 `.css` 文件, 而是每次都从源服务器请求, 这样就避免了修改响应头的问题.

### 更好的解决方法

根据上面的结果, 如果每次从源服务器获取 `.css` 会给服务器带来一定的压力, 所以我们可以使用 CloudFlare 的 "响应标头转换规则", 强制修改指定请求的标题.

但是这个功能不支持免费用户使用(悲).

![4](https://image.meorion.moe/image/cloudflareProxyTextPlain/4.webp)

---

但是在这过程中我发现一个奇怪的问题, 我使用curl请求的响应头是正常的, 但是浏览器却是异常的.

![1](https://image.meorion.moe/image/cloudflareProxyTextPlain/1.jpg)
