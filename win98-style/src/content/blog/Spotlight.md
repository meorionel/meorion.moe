---
title: 写一个右键聚光灯特效
pubDate: 2024-03-12T08:22:44+08:00
---

# 代码分析

看图可以发现,这个右键有两个部分, 一个是右键菜单 `circle`和聚光灯 `overlay`(中文和英文没有关系, 英文是页面中div的class名).

本文不介绍菜单（这个东西没什么好说了, 九六个a标签围一圈加个触发动画）, 主要说说这个跟随鼠标移动的聚光灯是怎么做到的

![1](https://image.meorion.moe/image/Spotlight/1.webp)

当我们移动鼠标的时候, 会发现 class为 `large`的div的style一直在变化, 主要为 `left`,`top`,`background-position`三个属性.

其中, `left`和 `top`两个属性是用于控制div的位置的, `background-position`是控制背景图片跟随div位置变化的.在css中, `background-position` [CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS) 属性为每一个背景图片设置初始位置.

至此, 原理就很明显了, 元素设置为绝对定位, 元素的 `top `和 `left`属性会让元素跟随鼠标移动, 而 `background-position`属性会让子元素的背景图片会与鼠标的移动方向相反移动, 这样便能实现聚光灯的效果.

# 代码实现

讲太多太复杂了, 直接贴代码.

```html
<div class="Parent" id="Parent">
	<div class="Daughter" id="Daughter"></div>
</div>
```

```css
.Parent {
	width: 100vw;
	height: 100vh;
	display: none;
	background-color: rgba(0, 0, 0, 0.8);
}

.Daughter {
	width: 300px;
	height: 300px;
	position: absolute;
	top: 0;
	left: 0;
	background-color: #ffffff;
	border-radius: 300px;
	background: url("需要显示的图片");
	background-position: 100px 100px;
	background-repeat: no-repeat;
}
```

```javascript
// 屏蔽默认的浏览器自带右键
window.oncontextmenu = function (e) {
	e.preventDefault();
};

const Parent = document.getElementById("Parent");
const Daughter = document.getElementById("Daughter");
const body = document.body;
// const audio = new Audio('音效链接');

// 按下右键时显示聚光灯, 否则隐藏
window.onmousedown = function (e) {
	if (e.button == 2) {
		Parent.style.display = "block";
		body.style.cursor = "none";
		// audio.play()
	} else {
		Parent.style.display = "none";
		body.style.cursor = "auto";
	}
};

// 聚光灯跟随鼠标以及背景移动逻辑
document.onmousemove = function (event) {
	let left = event.clientX;
	let top = event.clientY;
	Daughter.style.left = left - 100 + "px";
	Daughter.style.top = top - 100 + "px";
	Daughter.style.backgroundPosition = "-" + left + "px " + "-" + top + "px";
};
```

至此, 一个右键的聚光灯效果就做完了, 如果有需要可以把负责播放音效的两行代码注释掉, 放入你的音效链接, 就开始开启社死效果了（
本文代码效果

![2](https://image.meorion.moe/image/Spotlight/2.gif)
