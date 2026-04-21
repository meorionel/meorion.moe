---
title: GSAP 动画库
pubDate: 2023-12-28T15:42:14+08:00
updatedDate: 2024-11-15T18:11:32+08:00
---

GSAP 是一个 JavaScript 库, 用于创建高性能、跨浏览器的动画. 它允许你轻松地动画化任何 JavaScript 可以操作的元素.

一般我们制作动画会用 css 属性`animations`, 但是`animations`并不是特别方便. 比如说我想要控制动画在进入视口的时候触发, 需要配合 JavaScript, 这并不是一种健康的操作, 所以我们选择 GSAP.

## 安装 & 引入

```shell
# 通过pnpm安装
pnpm install gsap

# 通过yarn安装
yarn add gsap

# 通过CDN安装
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/gsap.min.js"></script>
```

在 vue 中引入 GSAP.

```vue
<template>
	<div class="div" ref="div" style="width: 100px; height: 100px; background-color: red"></div>
</template>

<script>
import { gsap } from "gsap";

export default {
	mounted() {
		gsap.to(this.$refs.div, { x: 100, duration: 1, repeat: -1, yoyo: true });
	},
};
</script>
```

## 实现一个简单的动画

```javascript
gsao.to(".box", { x: 200 });
```

这样 box 就会向右移动 200px, 让我们分析一下这个简单移动的语法。

![1](https://image.meorion.moe/image/GSAP/1.webp)

一个方法(method)、一个目标(target)和一个变量(variables)。

### 从方法(method)开始

有四种方法，或者说`tweens`，`tweens`是 GSAP 官方的说法，我也不知道这个代表什么，可能他们喜欢创造一些新东西。

- gsap.to(): 这是最常见的方法，他会从元素当前的状态开始运行动画。

- gsap.form(): 这个就像是`.to()`翻过来一样，他会从方法中定义的值开始运行动画，如果你设置了 x: 200，他会就从元素原本位置的右边 200px 的位置开始执行动画，移动到元素原本的位置。

- gsap.formTo(): 这由你来定义起始的位置和结束的位置。

- gsap.set(): 这是一个没有动画的方法，把过度时间给去掉了。

### 目标(target)或者多个目标

GSAP 能接收的目标有很多种，基础的`.class`和`#id`，你甚至可以传入变量或者数组。

```javascript
// 使用class或者id
gsap.to(".box", { x: 200 });
gsap.to("#box", { x: 200 });

// 使用变量
cons box = document.querySelector(".box");
gsap.to(box, { x:200 });

// 使用数组
cons box1 = document.querySelector(".box1");
cons box2 = document.querySelector(".box2");
gsap.to([box1, box2], { x: 200 });
```

注意，如果你使用的是 vue，可以使用 ref 去选择元素

```javascript
// vue
<div ref="box"></div>
gsap.to(this.$refs.box, { x:200 }});
```

### 最后是变量(variables)

变量是设置动画的关键，你可以设置很多和动画相关的信息，例如`duration` 、 `onComplete`或`repeat`。

```javascript
gsap.to(target, {
	x: 200, // 向右移动200px
	rotation: 360, // 旋转360°
	duration: 2, // 动画时长2s
});
```

当然，就和开头说的一样，GSAP 的变量会比 css 属性短，这是因为 GSAP 提供了简写，下面是一些常用变量和他们的 css。

|             GSAP              |                 CSS                 |               作用               |

| :---------------------------: | :---------------------------------: | :------------------------------: |

|             x:100             |          translateX(100px)          |           向右移动 100px          |

|            y: 100             |          translateY(100px)          |           向下移动 100px          |

|         xPercent: 50          |           translateX(50%)           |           向右移动 50%           |

|         yPercent: 50          |           translateY(50%)           |           向下移动 50%           |

|           scale: 2            |              scale(2)               |             逐渐变大             |

|           scaleX: 2           |              scaleX(2)              |           水平方向增长           |

|           scaleY: 2           |              scaleY(2)              |           垂直方向增长           |

|         rotation: 90          |            rotate(90deg)            |         顺时针旋转 90deg         |

|      rotation: "1.25rad"      |               no css                |         顺时针旋转 1.25rad        |

|           skew: 30            |             skew(30deg)             |           倾斜旋转 30deg          |

|           skewX: 30           |            skewX(30deg)             |         水平倾斜旋转 30deg        |

|       skewY: "1.23rad"        |               no css                |       垂直倾斜旋转 1.25rad       |

| transformOrigin: "center 40%" |    transform-origin: center 40%     |           更改旋转的原点          |

|          opacity: 0           |     adjust the elements opacity     |               可见度              |

|         autoAlpha: 0          | shorthand for opacity & visibility  |             不透明度             |

|          duration: 1          |       animation-duration: 1s        |           动画时长 1S            |

|          repeat: -1           | animation-iteration-count: infinite |         重复（一直重复）         |

|           repeat: 2           |    animation-iteration-count: 2     |       重复（重复 1+2 次）        |

|           delay: 2            |         animation-delay: 2          |         延迟 2S 播放动画         |

|          yoyo: true           |   animation-direction: alternate    | 从头到尾再到头，配合 repeat 使用 |

> 默认情况下，GSAP 使用的单位是 px，你也可以使用其他的单位，例如 vw、rad，甚至计算他们，只需要你给他们加上引号。
>
> ```javascript
> x: 200,
> x: "200vw",
> x: () => window.innerWidth / 2,
> ```

当然, 上面表格中的变量很有限, 但是 GSAP 支持几乎所有原生的 css 样式,只需要使用驼峰命名法,就像 [JavasSript](https://zh.javascript.info/styles-and-classes#yuan-su-yang-shi) 那样.

例如 `background-color ` => `backgroundColor`

```javascript
gsap.to(".box", {
	x: 200,
	backgroundColor: "#583229",
});
```

## Easing, 添加一点点动画曲线

`ease: "none.out"`可以给动画加一个缓和的效果

第一个值 `none`需要填写 GSAP 官方提供的几种动画类型名称，例如 `power1`,`back`,`bounce`;

第二个值 `out`可以更换为 `in`或者 `inOut`，三个值的区别在于 `in`是动画开头时开始缓和效果，`out`是动画结束时开始缓和效果（直白一点就是把函数正反表示）

[官方的曲线实验场](https://gsap.com/resources/getting-started/Easing)

![2](https://image.meorion.moe/image/GSAP/2.webp)

## Staggers, 让你的元素有序触发

`Staggers`这个变量可以让多个元素按顺序触发

```javascript
<div class="box red"></div>
<div class="box yellow"></div>
<div class="box blue"></div>
<div class="box green"></div>

<script>
    gsap.to(".box",{
        x: 300,
        // 当stagger设置为0.3时，yellow会在red动画结束后0.3s触发自己的动画，之后的元素以此类推
        stagger: 0.3,
    })
</script>
```

`Staggers`可以配合 Grid 网格布局使用，做出很惊艳的群体动画效果

```javascript
stagger: {
    grid: [13, 8],
    from: "center",
    axis: "y",
    ease: "none",
    amount: 0.7,
}
```

## Timeline 给你的动画创造一条时间线

`stagger`似乎能够一些需求了, 但是如果你要设置的动画有很多元素,甚至使用`v-for`渲染的, 那样`stagger`似乎就有些不够用了.

没事的, GSAP 为了解决这个问题创建了`Timeline`, 有了`Timeline`, 你就可以很轻松地管理你的元素动画了.

```javascript
// 创建一个Timeline实例
let tl = gsap.timeline();

// 将元素添加进时间线, 注意! 这里使用的是tl.to而不是gsap.to
tl.to(".green", { x: 600, duration: 2 });
tl.to(".purple", { x: 600, duration: 1 });
tl.to(".orange", { x: 600, duration: 1 });
```

如果你想让你元素的动画有一点延迟, 可以使用`delay`, 不过在`Timeline`, 更推荐你使用`Position Parameter`, 就是那些跟在花括号后面的参数.

```javascript
let tl = gsap.timeline();

// 从时间轴的第一秒开始播放
tl.to(".green", { x: 600, duration: 2 }, 1);

// 在上一个元素动画开始的地方开始播放
tl.to(".purple", { x: 600, duration: 1 }, "<");

// 在时间线结束后一秒
tl.to(".orange", { x: 600, duration: 1 }, "+=1");
```

`Timeline`有一些特殊属性, 他们需要你在创建实例时设置.

```javascript
let tl = gsap.timeline({ repeat: -1, repeatDelay: 1, yoyo: true });

tl.to(".green", { rotation: 360 });
tl.to(".purple", { rotation: 360 });
tl.to(".orange", { rotation: 360 });
```

`Timeline`还可以给元素设置默认值, 避免你一边又一遍地写重复的变量.

```javascript
var tl = gsap.timeline({ defaults: { duration: 1 } });

tl.to(".green", { x: 200 }).to(".purple", { x: 200, scale: 0.2 }).to(".orange", { x: 200, scale: 2, y: 20 });
```

## 用函数控制你的动画

GSAP 提供了八个函数用于控制动画的效果, 通过这些函数可以更好地控制你的动画(反正我是没用过了 hhh).

- tween.play(): 开始播放
- tween.pause(): 暂停
- tween.reverse(): 倒转
- tween.seek(0.5): 跳转到 0.5 秒的位置
- tween.progress(0.25): 跳转到动画的 1/4 处
- tween.timeScale(2): 加 2 倍速
- tween.kill(): 杀死动画
- tween.timeScale(2).reverse(): 以二倍速倒放

```html
<button onclick="tween.play()">开始</button>
<button onclick="tween.pause()">暂停</button>
<button onclick="tween.reverse()">倒转</button>
<button onclick="tween.seek(0.5)">跳转到0.5s的位置</button>
<button onclick="tween.progress(0.25)">跳转到动画的1/4处</button>
<button onclick="tween.timeScale(2)">加2倍速</button>
<button onclick="tween.kill()">杀死动画(</button>
<button onclick="tween.timeScale(2).reverse()">以二倍速倒放</button>

<script>
	let tween = gsap.to(".box", {
		x: 200,
	});
</script>
```

## 使用回调运行你的函数

GSAP 提供了五个回调函数, 用来在动画的各个阶段触发指定的 js 代码.

onComplete ：动画完成时调用。
onStart ：动画开始时调用
onUpdate ：每次动画更新时调用（在动画处于活动状态时的每一帧上）。
onRepeat ：每次动画重复时调用。
onReverseComplete ：当动画反转时再次到达开头时调用。

```javascript
let tween = gsap.to(".box", {
	x: 500,
	duration: 5,
	rotation: 360,
	ease: "none",
	paused: true,
	onStart: () => console.log("动画开始播放"),
	onComplete: () => console.log("动画完成播放"),
	onUpdate: () => console.log("动画状态更新"),
	onRepeat: () => console.log("动画重复播放"),
	onReverseComplete: () => console.log("动画反转完成播放"),
	onStart: tlStart,
});
function tlStart() {
	console.log("动画开始时调用外部函数");
}
```
