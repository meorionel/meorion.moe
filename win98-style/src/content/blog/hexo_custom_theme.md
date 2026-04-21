---
title: 从0开始入门Hexo
pubDate: 2024-02-07T20:25:10+08:00
updatedDate: 2024-11-03T14:06:40+08:00
---

> 本文最初写于24年2月7日，在24年11月3日最后一次更新修改后归档。

如果你刚学完JavaScript，并且已经能够写一些静态网页，还对自制博客主题感兴趣，那么这篇文章或许对你会有一些作用。

当然如果你对这篇文章有什么疑问欢迎通过主页的联系方式询问我。

本文涉及指令方面主要以pnpm包管理器为主。

## 准备工作

在正式开始学习之前，你需要对开发环境进行一下确认以及了解一下hexo默认的技术栈。

根据[Hexo概述](https://hexo.io/zh-cn/docs/)配置你的开发环境，以确保你能够正常开发主题。

- EJS模板引擎：这是Hexo自带的模板语法
- Stylus：这是Hexo自带的css预处理器
- Yaml：这是一种专门用来写配置文件的语言

当然，如果你想的话可以把`EJS`换成`Nunjucks`。或者把`Stylus`换成`less`或者`sass`，甚至直接用`css`都可以，你喜欢就好。

本文直接使用`EJS`+`Stylus`。

本文会有很多地方涉及到目录，所以需要先说明一下：

- `./`这个代表项目的根目录。
- `themeDemo/`这个代表主题的根目录。

> 在开始之前你还需要注意，不要因为一些报错或者困难就放弃，文章可能会有一些部分比较抽象，请多往后看看，可能你看到后面就能理解了，如果还不能理解可以看看[Hexo官方的文档](https://hexo.io/zh-cn/docs/)。
>
> 对于初学者来说文章文档确实是很难读懂的东西，但既然你打算自制主题了，就不要放弃，坚持到最后你会收获很多的。

## 创建你的Hexo项目

```shell
# 初始化一个Hexo项目(报错了? 首先检查一下报错的内容, 这里报错多半是因为你没有配置好环境, 例如忘记安装Hexo脚手架)
hexo init demo
# 进入文件夹
cd demo
# 安装依赖
pnpm i
# 启动项目, c 用于清空缓存; g用于生成静态文件; s用于启动服务器
hexo c; hexo g; hexo s
```

在一串刷屏后你能看见控制台输出了一个链接: `http://localhost:4000/`，在浏览器打开这个链接就能看见Hexo默认的主题了。

![hexo_default_theme](https://image.meorion.moe/image/hexo_custom_theme/hexo_default_theme.webp)

这个时候博客的文件目录如下。

我们只需要关注有注释的文件和目录就好了。

```text
.demo
├────.github
├────node_modules
├────public                 # 这是Hexo自动生成的静态文件目录
├────scaffolds
├────source                 # 这个文件夹用于存放你的文章、页面
├────themes                 # 这个文件夹用于存放我们的主题文件.
├──.gitignore
├──_config.landscape.yml
├──_config.yml              # 这个文件是Hexo的站点配置文件
├──db.json
├──package.json
├──pnpm-lock.yaml
└──yarn.lock

```

## 尝试写一篇文章

先写一篇文章让你有一些感觉。

我们需要在开头写`Front-matter`，`Front-matter`是`yaml`/`json`格式的代码块，具体内容查看[文档](https://hexo.io/zh-cn/docs/front-matter)。

然后随便写一些内容就会被渲染出来。

```mark
---
title: test
date: 2024/11/3 15:04
tags:
  - tag1
  - tag2
categories:
  - class
---

# 这是我的第一篇博客文章

这是一些正文内容.
```

![first_article](https://image.meorion.moe/image/hexo_custom_theme/first_article.webp)

## 创建基本的页面

现在我们开始正式写主题，首先需要在`themes`目录下创建一个文件夹作为我们的主题文件，文件名就是你的主题名字。

```text
.demo
└─themes
  └─themeDemo
    ├─layout        # 主题布局模板文件
    ├─source        # 资源文件目录，存放样式文件，js脚本等
    └─_config.yml   # 主题配置文件

```

我们如果想要主题生效需要修改Hexo的站点配置文件`_config.yml`。

大概位于99行附近，将`theme`的值修改为你的主题的名字，例如我这里主题名是`themeDemo`，那么就需要修改为`theme: themeDemo`。

如果修改了站点配置文件，需要重启项目才能让修改的内容生效。

```yaml
# Extensions
## Plugins: https://hexo.io/plugins/
## Themes: https://hexo.io/themes/
theme: themeDemo
```

> 关于配置文件：
>
> 在Hexo中有两种配置文件，一种是Hexo的站点配置文件，也就是位于项目根目录的`_config.yml`。另外一种是主题的配置文件，也就是位于主题根目录的`_config.yml`。
>
> 这里把站点配置文件的各种键值作用写出来以供参考。
>
> ```yaml
> # Site
> title: Hexo # 网站的标题
> subtitle: "" # 网站的副标题
> description: "" # 网站的描述，会在搜索引擎中显示
> keywords: # 网站的关键词。用于优化搜索引擎，帮助搜索引擎了解网站内容
> author: John Doe # 网站的作者
> language: en # 网站的语言
> timezone: "" # 网站的时区，用于管理显示的日期时间
>
> # URL
> url: http://example.com # 网站的基本URL
> permalink: :year/:month/:day/:title/ # 永久连接格式，默认格式表示文章链接根据发布时间和标题生成
> permalink_defaults: # 永久链接的默认设置
> pretty_urls: # 链接美化选项
>     trailing_index: true # 是否在链接尾部添加 index.html
>     trailing_html: true # 是否在链接末尾添加 index
>
> # Directory                  # 设置网站目录的基本结构
> source_dir: source # 存放源文件（css,js,image...）的目录
> public_dir: public # 公共文件目录，存放生成的静态网页文件的目录
> tag_dir: tags # 标签目录，存放标签页面的目录
> archive_dir: archives # 存档目录，存放存档页面的目录
> category_dir: categories # 分类目录，存放分类页面的目录
> code_dir: downloads/code # 代码目录，存放代码文件的目录
> i18n_dir: :lang # 国际化目录，存放国际化资源的目录
> skip_render: # 跳过渲染，指定哪些文件或目录不需要渲染
>
> # Writing
> new_post_name: :title.md # 新文章的文件名格式
> default_layout: post # 指定文章页的默认布局
> titlecase: false # 标题大小写转换，false表示不转换
> external_link: # 外部链接设置
>     enable: true # 是否启用在新标签页中打开外部链接
>     field: site # 外部链接设置的范围，site表示应用到整个站点
>     exclude: "" # 排除的外部链接
> filename_case: 0 # 文件名大小写设置，设置为0表示保持原样
> render_drafts: false # 渲染草稿文章，false表示不渲染草稿
> post_asset_folder: false # 文章资源文件夹，指定是否为每篇文章创建一个资源文件夹，false表示不创建
> relative_link: false # 相对链接，false表示不使用相对链接
> future: true # 未来文章日期，指定是否允许发布未来日期的文章，true表示允许
> syntax_highlighter: highlight.js # 语法高亮的插件，这里指定了highlight.js
> highlight: # highlight语法高亮的设置
>     line_number: true # 是否显示行号，true表示显示
>     auto_detect: false # 是否自动检测语言，false表示不自动检测
>     tab_replace: "" # 选项卡替换，留空表示没有替换
>     wrap: true # 是否换行，true表示换行
>     hljs: false # 是否启用highlight.js，false表示不使用
> prismjs: # psismjs语法高亮的设置
>     preprocess: true # 是否预处理，true表示预处理
>     line_number: true # 是否显示行号，true表示显示
>     tab_replace: "" # 选项卡替换，留空表示没有替换
>
> # Home page setting
> index_generator: # 首页的相关设置
>     path: "" # 博客首页的根目录
>     per_page: 10 # 每页显示的文章数量
>     order_by: -date # 文章的排序方式，-date表示按日期降序排序，意思是最新的文章排在前面
>
> # Category & Tag
> default_category: uncategorized # 默认分类，如果文章没有指定分类时自动归类到uncategorized
> category_map: # 分类映射，例如想要把a分类映射到b，可以在这里设置
> tag_map: # 标签分类，和上一项相同
>
> # Metadata elements
> meta_generator: true #元数据生成器。指定是否在生成的HTML页面中包含一个元数据标签来指示网站生成工具的名称和版本信息。
>
> # Date / Time format
> date_format: YYYY-MM-DD # 文章发布的日期显示格式
> time_format: HH:mm:ss # 文章发布的时间格式
> updated_option: "mtime" # 更新选项，指定如何处理文章更新时间的选项，mtime表示文件的修改时间为更新时间
>
> # Pagination
> per_page: 10 # 指定博客中每页显示的文章数量
> pagination_dir: page # 指定存放分页文件的目录
>
> # Include / Exclude file(s)
> ## 这些选项允许您指定要包含、排除或忽略的文件，通常应用于源文件夹。在这个例子中，这些选项被留空，表示没有进行额外的设置。
> include: # 包含
> exclude: # 排除
> ignore: # 忽略
>
> # Extensions
> theme: themeDemo # 指定文章的主题
>
> # Deployment
> deploy:
>     type: "" #部署站点的类型
> ```

### 构建基础的部分

重启完成后打开浏览器你会发现页面一片空白，并且控制台显示`WARN No layout: index.html`。

这是正常的，因为我们只是创建了主题，但是主题里面还什么都没有。

在`themeDemo/layout`目录下创建文件`index.ejs`（这个文件将会作为我们的主页文件）。

在这个文件中随便输入点什么内容，打开浏览器你就发现你输入的内容已经被渲染出来了，那么到这里就可以恭喜你，成功走出了第一步。

> 当初这一步浪费了我两天时间，因为当时的我真的是什么都不懂。

### 创建页面

现在我们要在`themeDemo/layout`目录下创建文件`layout.ejs`，这个文件你可以理解为是一个入口文件(?)，如果你不知道什么叫入口文件就算了，大概就是一个大框架，在这个框架中塞入各种东西。

`<%- body %>`是一个很重要的东西，他会将页面渲染进body，比如我们刚刚创建的`index.ejs`模板引擎就会将`index.ejs`渲染进`<%- body %>`。

```ejs
<!DOCTYPE html>
<html>
    <body>
        <div class="container">
            <%- body %>
         </div>
    </body>
</html>
```

文字太过于抽象，所以我们用一些实际的操作来解释更为形象。

首先创建页面需要使用命令 `hexo new page <page name>`，假如我们需要创建一个about页就需要执行`hexo new page about`。

这个命令会在`./source/`目录下创建一个文件夹和一个`index.md`文件，这个`index.md`就是一个页面。

我们需要在`index.md`文件的[`Front-matter`部分](https://hexo.io/zh-cn/docs/front-matter)添加上`layout: about` 告诉Hexo，这个页面要按照`about.ejs`文件来渲染。

然后在`themeDemo/layout`目录下创建一个`about.ejs`来写`about`页的内容。

接下来我们要在`themeDemo/layout`目录下创建一个目录`_partial`，这个目录我们会存放一些组件。

```html
# themeDemo/layout/_partial/head.ejs

<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />
	<title>Hexo</title>
</head>
c # themeDemo/layout/_partial/header.ejs

<header>我是导航栏</header>

# themeDemo/layout/_partial/footer.ejs

<footer>我是页脚</footer>
```

在`layout.ejs`文件中导入他们，你就能收获一个基础的多页面网站了。

```ejs
<!DOCTYPE html>
<html>
    <%- partial('_partial/head') %>
    <body>
        <div class="container">
            <%- partial('_partial/header') %>
            <%- body %>
            <%- partial('_partial/footer') %>
        </div>
    </body>
</html>
```

![fundamental_index](https://image.meorion.moe/image/hexo_custom_theme/fundamental_index.webp)![fundamental_about](https://image.meorion.moe/image/hexo_custom_theme/fundamental_about.webp)

> 让我猜猜你现在肯定对于上面的内容很懵，这是正常的，因为让我自己看我也会懵。
>
> 这里我会提炼一下上面的步骤，创建一个页面(以about页为例子)：
>
> 1. 执行 `hexo new page about` 创建一个页面.
> 2. 在 `./source/about/index.md` 文件的 `Front-matter` 中添加 `layout: about` .
>    (注意: `about`这个文件夹是Hexo自动生成的，如果没有请检查一下控制台有没有报错)
> 3. 在 `./themes/themeDemo/layout/` 目录下创建 `about.ejs` .
> 4. 然后在 `about.ejs` 中随便写一点东西.
> 5. 打开 `localhost:4000/about` 你就能看见你在 `about.ejs` 写的东西了.

### 变量

这个变量就是我们在配置文件中的键值，例如我们站点的配置文件中的配置就可以通过变量访问并渲染在页面上。

我们可以直接通过`config`去访问站点的配置文件，通过`theme`访问主题的配置文件。

![variable](https://image.meorion.moe/image/hexo_custom_theme/variable.webp)

### 辅助函数

辅助函数是Hexo提供的一些函数，可以减少我们在编写主题时的工作量。

[列表](https://hexo.io/zh-cn/docs/helpers)

## 完善一下，让他成为一个真正的博客

不出意外上面的步骤能够让你对Hexo以及ejs有一些基本的认识，现在我们就需要添加一些页面和功能实现一个真正的博客。

### 文章列表

这里我们需要借助变量和辅助函数，不过你如果不想动脑直接复制就好了。

```ejs
<% if (site.posts && site.posts.length) { %>
    <% page.posts.each(function (post) { %>
       <section>
            <a href="<%- url_for(post.path) %>">
                <%= post.title %>
            </a>
        </section>
    <% }) %>
<% } %>
```

在文章很多的情况下我们可能需要用到分页的功能。

现在假设我们有很多文章，在`./source/_posts/`目录下创建多个`.md`文件，或者直接复制自带的`hello-world.md`，复制很多个，这样文章列表就会出现很多文章。

在站点的配置文件中的87行左右可以修改每一页显示的文章数量，默认是10篇文章一页。

```yaml
# Pagination
## Set per_page to 0 to disable pagination
per_page: 10
pagination_dir: page
```

在你需要的地方添加上分页的代码：

```ejs
<% if (page.total > 1) { %>
    <nav class="page-nav">
        <%- paginator({
            prev_text: "« Prev",
            next_text: "Next »"
        }) %>
    </nav>
<% } %>
```

![article_list](https://image.meorion.moe/image/hexo_custom_theme/article_list.webp)

### 文章详细页

文章详细页不需要我们去执行创建页面的指令，我们直接在`themeDemo/layout`下创建`post.ejs`文件即可。

```ejs
<div class="info">
    <span><%= page.title %></span>
</div>
<div class="main">
    <div class="toc">
        <span>目录</span>
        <span><%- toc(page.content) %></span>
    </div>
    <div class="content">
        <div class="post-meta">
            <span class="post-time">发布于<%- date(page.date, "YYYY-MM-DD") %>๑•ิ.•ั๑</span>
        </div>
        <div class="post-content"><%- page.content %></div>
    </div>
</div>
```

![article](https://image.meorion.moe/image/hexo_custom_theme/article.webp)

### 添加分类和标签列表

```ejs
<section class="archive">
    <ul class="post-archive">
        <% site.categories.each(function (category) { %>
            <span><%= category.name %></span>
            <% category.posts.forEach(function(post) { %>
            <li class="post-item">
                <span class="post-date"><%= date(post.date, "YYYY-MM-DD") %></span>
                <a class="post-title" href="<%- url_for(post.path) %>"><%= post.title %></a>
            </li>
            <% }) %>
        <% }) %>
    </ul>
</section>
<section class="archive">
    <ul class="post-archive">
        <% site.tags.each(function (tag) { %>
            <span><%= tag.name %></span>
            <% tag.posts.forEach(function(post) { %>
            <li class="post-item">
                <span class="post-date"><%= date(post.date, "YYYY-MM-DD") %></span>
                <a class="post-title" href="<%- url_for(post.path) %>"><%= post.title %></a>
            </li>
            <% }) %>
        <% }) %>
    </ul>
</section>
```

## 编写样式

至此，我们完成了一个博客该有的基本功能，但是因为没有添加样式的原因所以页面并不好看。

在`themeDemo/source`下新建一个`css`目录，这里面将存放所有的样式文件。

篇幅原因，这里只写了导航栏的样式作为例子，相信聪明的你看了例子就能明白它的工作原理的。

在刚刚创建的`css`目录下创建一个`base.styl`文件作为样式的入口，之后所有的样式文件都在这里引入。

在`themeDemo/layout/_partial/head.ejs`文件中引入`base.styl`文件。

```ejs
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport">
    <title>Hexo</title>

    <%- css('css/base') %>
</head>
```

在`base.styl`里面可以写一些通用的样式，例如背景，a标签。

我们在`css`目录下新建`_partial`文件夹，当然你可以建这个文件夹，这只是为了方便理清楚文件结构。

在`_partial`文件夹中新建`header.styl`，这个文件将作为导航栏的样式，我们直接在`base.styl`文件夹中引入，引入后就可以编写导航栏的样式了。

```sty
@import '_partial/header'
```

## 一个能够增加开发效率的插件

上面学习的过程你多半会苦恼，为什么每次写一点都要回到浏览器去刷新才能看到效果，现在有了这个插件你就不用每次都回到浏览器刷新了。

这个插件可以实时监控文件变化并自动刷新页面。

```shel
pnpm install hexo-browsersync --save
```

安装完成后将项目跑起来就好了，控制台会输出三个链接，我们直接照旧使用4000端口的即可。
