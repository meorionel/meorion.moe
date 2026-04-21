---
title: 浏览器渲染流程 & 优化
pubDate: 2025-04-12T22:48:52+08:00
---

# 加载与构建

![load_flow](https://image.meorion.moe/image/browser_rendering_flow/load_flow.webp)

当你在浏览器上访问一个网站, 浏览器会先发起一个请求, 获取 html 文档.

> 如果你打开开发者工具 -> 网络选项卡, 然后刷新一下就能看见第一个请求就是 html 文档, 点开就能看到服务器返回的当前页面的 html 文件.

当浏览器拿到返回的 html 文档就会从头开始解析 html, css, 构建 dom(document object model 文档对象模型), cssom(css object model css 对象模型)树,.

在解析过程中如果碰到 JavaScript 脚本会阻塞解析并执行脚本, 这是因为脚本可能会修改 DOM 元素, 所以需要暂停执行.

当然, 如果 JavaScript 脚本是`async/defer`的就不会阻塞解析.

## defer

`defer`会告诉浏览器不要等待脚本, 浏览器会继续处理 html, 脚本会在后台下载, 等待 DOM 构建完成脚本才会执行, 在`DOMContentLoaded`事件之前执行.

下面这个栗子, 页面的内容会立刻显示, `DOMContentLoaded`事件会等待下面的`defer`脚本执行完成才会被触发.

```html
<p>...content before scripts...</p>

<script>
	document.addEventListener("DOMContentLoaded", () => alert("DOM ready after defer!"));
</script>

<script defer src="https://javascript.info/article/script-async-defer/long.js?speed=1"></script>

<p>...content after scripts...</p>
```

具有`defer`的脚本会保持脚本的相对顺序.

下面这个例子, 当浏览器解析到它们时会并行下载, 但是尽管`small.js`比`long.js`先下载完成, 但也会等到`long.js`加载完成后才会执行`small.js`.

```html
<script defer src="https://javascript.info/article/script-async-defer/long.js"></script>
<script defer src="https://javascript.info/article/script-async-defer/small.js"></script>
```

## async

`async`虽然和`defer`相似, 但是`async`不会等待其他脚本加载, 谁先下载完成谁先执行.

`DOMContentLoaded`事件也不会和`async`等待.

---

## 外部资源

在解析 html 文档的过程中如果遇到了外部资源会发起加载请求, 有些资源是异步请求, 有些是同步请求, 这取决于资源类型和 html 的显式控制.

一般遇到`<img>`、`<script async/defer>`、`<link>（CSS）`、`<iframe>`等外部资源时, 浏览器会发起异步请求(并行下载), 同时继续解析 HTML.

当遇到同步 JavaScript (无 async/defer)时会停止解析, 等待 JavaScript 脚本下载&执行完成后才会继续解析.

| 资源类型         | 默认加载行为           | 是否阻塞解析 | 是否阻塞渲染 |
| ---------------- | ---------------------- | ------------ | ------------ |
| `<script>`       | 同步（无属性时）       | ✅ 是        | ✅ 是        |
| `<script async>` | 异步（下载不阻塞解析） | ❌ 否        | 执行时阻塞   |
| `<script defer>` | 异步（延迟执行）       | ❌ 否        | ❌ 否        |
| `<link css>`     | 异步下载               | ❌ 否\*      | ✅ 阻塞渲染  |
| `<img>`          | 异步下载               | ❌ 否        | ❌ 否        |

> \*注：CSS 下载不阻塞 HTML 解析，但会阻塞渲染（避免 FOUC）。

举个栗子:

```html
<html>
	<head>
		<!-- 异步下载，阻塞渲染 -->
		<link rel="stylesheet" href="style.css" />
		<!-- 同步阻塞解析 -->
		<script src="sync.js"></script>
		<!-- 异步，可能乱序执行 -->
		<script async src="async.js"></script>
	</head>
	<body>
		<!-- 异步加载，不阻塞 -->
		<img src="image.png" />
	</body>
</html>
```

## DOM 树

当我们有下面这些元素, 就会生成下面的 DOM 树.

```html
<div>
	<h1>Ciallo~</h1>
	<p>World</p>
</div>
```

```
div
 ├── h1
 │   └── "Ciallo~"
 └── p
     └── "World"
```

## CSSOM 树

当我们有下面这些 CSS 元素, 就会生成下面的 CSSOM 树

```css
div {
	width: 240px;
	background-color: aliceblue;
}
h1 {
	font-size: 2rem;
}
p {
	opacity: 80%;
}
```

```
stylesheet
 ├── div
 │   ├── width: 240px;
 │   └── background-color: aliceblue;
 ├── h1
 │   └── font-size: 2rem;
 └── p
     └── opacity: 80%;
```

---

# 渲染

当 DOM 树和 CSSOM 树构建完成后会被合并成渲染树.

渲染树只会包含可见元素.

- `display: none`: 就不会进入渲染树
- `opacity: 0`: 会进入渲染树, 但是因为因为完全透明则看不见
- `visibility: hidden`: 会进入渲染树但是不会被绘制

正式渲染时, 浏览器会计算布局(Layout): 节点的尺寸 / 位置, 然后绘制(Paint): 将元素绘制到屏幕上将最终的网页展示给我们.

上面我们距离了 DOM 树和 CSSOM 树, 下面他俩合并的渲染树.

```
Render Tree
└── div (width: 240px, background-color: aliceblue)
    ├── h1 (font-size: 2rem)
    └── p (opacity: 80%)
```

# 优化技巧

前面我们了解了渲染的流程, 那么我们可以基于渲染流程进行一些性能优化.

因为浏览器渲染是单线程渲染的, 所以当任务过多或者任务耗时时就会导致页面加载过久 / 卡顿.

## 1. 减少 DOM 操作

避免频繁地操作 DOM, 因为频繁操作 DOM 会触发浏览器的重排(Reflow)和重绘(Repaint), 消耗大量计算资源.

合并对 DOM 的操作, 将多次操作合并为一次或者少量操作, 减少页面的渲染次数.

使用`DocumentFragment`, 这是一个轻量的`Document`, 和真实的`Document`一样, 但是它并不存在于真实的 DOM 树中, 所以它的变化不会触发 DOM 树的重现渲染, 也不会影响性能.

```javascript
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
	const div = document.createElement("div");
	div.textContent = `Item ${i}`;
	fragment.appendChild(div);
}
document.body.appendChild(fragment); // 仅一次插入操作
```

## 2. 动画优化

减少使用 js 动画, 尽量使用 css 动画.

浏览器会对`transform`, `opacity`等属性进行优化, 使用GPU加速.

而且 css 动画会独立于主线程运行, 不会阻塞渲染.

相反, js 动画依赖于主线程, 如果逻辑过于复杂或者 DOM 操作频繁, 可能会造成阻塞.

## 3. 图片视频懒加载

对于图片或者视频, 可以使用`loading="lazy"`进行优化, 这个属性会让浏览器推迟加载屏幕外的图像, 直到视口滚动到其附近, 避免一次性加载过多的资源造成卡顿.

## 4. web worker

`Web Worker` 是浏览器提供的一种 JavaScript 多线程技术, 主要用于耗时任务. 其允许开发者在后台运行脚本, 避免主线程（UI 线程）被长时间任务阻塞, 从而提升网页性能和用户体验.

传统的 js 处于主线程运行, 而`Web Worker`会创建一个子线程在后台执行任务, 并且其子线程会独立的 JavaScript 运行环境，无法直接访问 DOM、window 对象或 document 对象。

主线程和 `Web Worker` 线程通过 `postMessage` 发送消息，通过 `onmessage` 接收消息, 数据会被复制而不是直接共享内存。

举个栗子

```javascript
// main.js

// 创建 Worker
const worker = new Worker("worker.js");

// 发送消息给 Worker
worker.postMessage({ data: "Start processing" });

// 接收 Worker 的消息
worker.onmessage = (event) => {
	console.log("Result from Worker:", event.data);
};
```

```javascript
// worker

// 监听主线程的消息
self.onmessage = (event) => {
	const result = doHeavyCalculation(event.data);
	self.postMessage(result);
};

function doHeavyCalculation(data) {
	// 模拟耗时操作
	return data.toUpperCase();
}
```
