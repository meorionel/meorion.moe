---
title: nuxtjs/content v3 简单入门
pubDate: 2024-10-18T20:25:10+08:00
updatedDate: 2024-11-12T14:06:40+08:00
---

@nuxtjs/content 是 nuxt3 官方的一个 CMS(内容管理)插件, 可以方便的将 markdown 文件作为内容进行管理, 并且支持搜索, 分页, 分类等高级功能.

因为网上关于这个插件的中文教程似乎很少, 而且对我来说, 即使是官方的英文文档就算用上沉浸式翻译阅读起来也十分吃力(我太菜力), 所以我就写一篇文章, 记录一下我的学习过程, 希望能帮到有需要的人.

## 安装

```bash
# 使用npx
npx nuxi@latest init content-app -t content

# 使用pnpm
pnpm install @nuxt/content
```

在`nuxt.config.ts`文件中加入插件.

```ts
modules: ["@nuxt/content"],
```

## 实现基本功能

在项目根目录创建一个`content`文件夹, 这个文件夹是用来存放文件的, 关于他的具体作用可以看 nuxt3 的[官方文档](https://nuxt.com.cn/docs/guide/directory-structure/content)

在`content`文件夹下创建`index.md`和`demo1.md`, 新建一个文件夹`articles`, 并在里面放一个`article1.md`, 作为我们的测试文件.

目录如下:

```text
content
├── index.md
├── demo1.md
└── article
    └── article1.md
```

### 渲染内容

在`.md`文件里面随便写入一些内容, 插件会自动将第一个标题作为文章的标题(title), 第一段文本作为描述(description).

`content`插件会自动识别`content`文件夹下的所有文件, 并且自动生成对应的路径, 并不需要我们进行多余的配置.

例如我们刚刚在文件夹下创建的两个文件:

|                              |                    |
| ---------------------------- | ------------------ |
| 文件                         | 路径               |
| content/index.md             | /                  |
| content/demo1.md             | /demo2             |
| content/articles/article1.md | /articles/article1 |

这个时候我们在`app.vue`中添加`<ContentDoc />`标签, 打开页面, 你就能发现你在`index.md`文件中写的内容被渲染出来了, 在地址栏中输入`localhost:3000/demo2`就能看见`demo2`的内容, `articles`文件夹下的内容也是如此.

现在我们知道了如何渲染内容, 但是一般来说我们都是需要先渲染一个列表出来, 再通过点击列表跳转到指定的文章页显示内容.

### 渲染列表

在渲染列表之前我们需要做些准备工作.

首先, 我们要确保`/content`下的`articles`, `/pages`下的`articles`这两个文件夹的名字是一致的.

其次, 我们需要在`/pages/articles`下创建一个`[...slug].vue`文件, 这个文件夹是用来渲染内容的.

确认好上面的之后, 你就可以在你需要的地方加入列表了.

```vue
<ContentList path="/articles" v-slot="{ list }">
    <div v-for="article in list" :key="article._path">
        <NuxtLink :to="article._path">
            <h2>{{ article.title }}</h2>
            <p>{{ article.description }}</p>
        </NuxtLink>
    </div>
</ContentList>
```

- path: 指定了要渲染的路径.
- v-slot: 插槽, 可以获取到渲染的内容.

我们可以通过`v-for`渲染出列表, 并通过`article`去获取文章的信息, 例如路径, 标题, 描述.

在`[...slug].vue`文件中加入`<ContentDoc />`标签, 这样我们点击标题或者描述就可以跳转到文章详细页了.

#### 使用queryContent()渲染

一般来说用`<ContentList />`渲染列表是没问题的, 但是你会发现列表渲染的顺序是随机的, 并不是固定按照某个规则进行渲染.

如果你想要它按照时间或者名字排序, 就需要使用`queryContent()`进行渲染了.

`queryContent()`不是标签, 而是一个方法, 这个方法会获取指定目录下所有文章的信息并作为一个数组暴露出来, 所以需要配合`v-for`进行渲染.

```vue
<template>
	<div class="article" v-for="item in articles" :key="item._path">
		{{ item }}
	</div>
</template>

<script setup>
const articles = await queryContent("articles")
	.where({ _path: { $contains: "/articles/" } }) // 获取 /content/articles 目录下所有的文章
	.sort({ data: -1 }) // data 是 Front-matter 中的信息, 我这里 data 表示创建文章的日期 -1 表示降序排序
	.find();
</script>
```

### Front-matter

这个东西是写在文档顶部的东西, 作用大概就是让你可以随意设置文章的各种信息.

在我们上面渲染列表的时候涉及到了一个东西`article.title`, 这个就是文章的信息(title, description).

如果你没有设置 Front-matter, 那么插件会自动将第一个标题作为文章的标题, 第一段文本作为描述(description).

```markdown
---
title: 文章1
description: 这是文章1的简介
---

这是 article1 的正文
```

官方的文档中写了一个原生的参数, 实际上你可以随意设置里面的键值, 比如创建时间修改时间.

```markdown
---
title: 文章1
description: 这是文章1的简介
create_time: 2022-07-21 15:00:00
update_time: 2022-07-21 15:00:00
author: AliceClodia
tags: [tag1, tag2]
categories: [category1, category2]
---
```

当然, 如果你要渲染这些键值就需要修改列表的代码.

![自定义键值](https://image.meorion.moe/image/nuxt_content/3.webp)

```vue
<ContentList path="/articles" v-slot="{ list }">
    <div v-for="article in list" :key="article._path">
        <NuxtLink :to="article._path">
            <h2>{{ article.title }}</h2>
            <p>{{ article.description }}</p>
            <p>{{ article.create_time }}</p>
            <p>{{ article.update_time }}</p>
            <p>{{ article.author }}</p>
        </NuxtLink>
    </div>
</ContentList>
```

## 可能会遇到的问题

当你部署到你的服务器上, 同时你还使用了 nginx , 此时你通过`<NuxtLink>`导航到列表或者内容页的时候就可能会遇到列表和内容没有被正确渲染.

页面显示 `You should use slots with <ContentRenderer>`, 打开控制台会看到 502 bad gateway 的报错.

![报错](https://image.meorion.moe/image/nuxt_content/2.webp)

这是一个服务端的问题, 所以即使你在开发环境绞尽脑汁都没法复现.

我在@nuxtjs/content 的 github issues 页看到很多人都有这个问题, 但是也没找到什么解决方法.

不过我在查文档的时候, 发现 nuxt2 的文档有关于 nginx 的配置, 用了这个配置就可以正常渲染了.

[文档地址](https://v2.nuxt.com/deployments/nginx/)

```text
map $sent_http_content_type $expires {
    "text/html"                 epoch;
    "text/html; charset=utf-8"  epoch;
    default                     off;
}

server {
    listen          80;             # the port nginx is listening on
    server_name     your-domain;    # setup your domain here

    gzip            on;
    gzip_types      text/plain application/xml text/css application/javascript;
    gzip_min_length 1000;

    location / {
        expires $expires;

        proxy_redirect                      off;
        proxy_set_header Host               $host;
        proxy_set_header X-Real-IP          $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto  $scheme;
        proxy_read_timeout          1m;
        proxy_connect_timeout       1m;
        proxy_pass                          http://127.0.0.1:3000; # set the address of the Node.js instance here
    }
}
```

但是当你修改好配置后你可能会发现, 加载时间太长了, 很不合理.

![加载时间过长](https://image.meorion.moe/image/nuxt_content/1.webp)

上面的是通过 ip 直接访问的, 下面是通过域名访问的.

我问 GPT, 他说可能是因为 nginx 的缓存问题, 但是我并不会整这个玩意, 所以我就修改了打包的命令.

```bash
# 正常的打包命令
pnpm run dev
# 将所有文件打包成多个静态的html文件
pnpm run generate
```

直接将所有文件打包成静态的, 这样就能有效减少加载时间了.

## 实现进阶功能

### 搜索

你需要在`nuxt.config.ts`中添加配置.

```typescript
content: {
    experimental: {
        // 启用搜索功能, 这里编辑器可能会报错, 不用理会, ts是这样的
        search: true,
    },
},
```

然后在你需要添加搜索的地方加上如下代码即可.

注意! 不要照抄[官方文档](https://content.nuxt.com/usage/search)的代码, 那个是错误的, 会让你喜提 500 报错.

```vue
<script setup>
// 搜索框的值
const search = ref("");
// 搜索返回的数据
const results = ref([]);

// 搜索函数
const handleSearch = async () => {
	results.value = await searchContent(search);
};
</script>

<template>
	<main>
		<input v-model="search" />
		<button @click="handleSearch">search</button>

		<pre>{{ results }} </pre>
	</main>
</template>
```
