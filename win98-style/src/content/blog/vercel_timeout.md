---
title: 修改vercel超时问题
pubDate: 2025-01-15T12:22:54+08:00
---

这段时间写了个 ai 聊天应用, 用 nuxt3 写的.

原本是打算使用 vue.js 做前端, node.js 做后端, 但是在部署测试的时候发现特别麻烦, 特别是后端代码更新, 因为后端是放在我的云服务上的, 每次更新都要手动去替换修改的文件.

但是前两天发现 nuxt3 可以写后端, [服务器 · 快速入门](https://nuxt.com.cn/docs/getting-started/server) 就打算用 nuxt3 重构.

今天把基础的功能都写完了, 部署到 vercel 发现只要 ai 回答时间一长就会出现卡死(?), 看控制台显示504的报错, 看 vercel 的 logs 发现是超时了.

上网搜了一下, 发现官方文档是有教修改超时时长的, 这就好办了.

[vercel文档](https://vercel.com/docs/functions/configuring-functions/duration#node.js-next.js-%3E=-13.5-or-higher-sveltekit-astro-nuxt-and-remix)

在 nuxt3 项目的根目录新建一个`nitro.config.ts`文件, 把下面的代码填进去.

这段代码可以将vercel请求的超时时间修改为 60s.

```typescript
import { defineNitroConfig } from "nitropack";

export default defineNitroConfig({
	vercel: {
		functions: {
			maxDuration: 60,
		},
	},
});
```

再装一下`nitropack`, 装完推上去就好了.

```bash
pnpm i nitropack
```

> 如果不装`nitropack`, vercel部署的时候会报错.

> 有个小插曲, 我刚开始是问GPT怎么解决vercel超时的, 结果GPT告诉我pro用户才能修改成60s, 我不死心去网上搜了一下才知道免费用户就能修改成60s, 靠嫩娘的GPT.
