---
title: 在 js 中如何遍历一个数组
pubDate: 2025-04-04T00:42:52+08:00
---

虽然这个标题看起来会有些弱智<img src="https://gcore.jsdelivr.net/gh/sooooooooooooooooootheby/Emoji_Chest@v1.0.0/package/aurakingdom/SerenaBlush.png" alt="SerenaBlush.png" class="emoji">, 遍历一个数组是任何一门编程语言的必学项目, 但是这两天我在做一个快速复制emoji的工具时发现在js中遍历一个数组居然有四种方法!

## for 循环

`for` 循环是一种很传统的写法, 但是操作空间很大, 比如可以随意操作遍历范围和步进.

下面这个例子就可以遍历从10到20的奇数.

```javascript
for (let i = 10; i < 20; i += 2)
```

还可以使用`break`和`continue`中断或者跳过本次循环.

下面这个例子循环到3时跳过本次循环, 循环到6时中断循环.

```javascript
for (let i = 0; i < 10; i++) {
	if (i === 3) {
		continue;
	}
	if (i === 6) {
		break;
	}
	console.log(i);
}
```

## for...of for...in

那么就有观众说了"a 主播主播 for循环固然方便, 但是有没有更独特的操作？"

有的 兄弟 有的.

`for...of`是 ES6 引入的 JavaScript 特有语法, 基于迭代器协议(Iterator Protocol). 其他语言(如 Python)的 `for` 循环行为类似 `for...of`, 但实现机制不同. (内容由 AI 生成，请仔细甄别<img src="https://gcore.jsdelivr.net/gh/sooooooooooooooooootheby/Emoji_Chest@v1.0.0/package/r1999/RegulusDance.gif" alt="RegulusDance.gif" class="emoji">)

`for...of`设计之初用于遍历可迭代对象(array, string...), 他遍历的是对象中的**值**, 会返回元素本身.

比如下面这个例子, 会逐个将数组中的每个数字打印出来.

并且加上`typeof`会显示打印的数据类型为`number`(划重点, 接下来要考).

```javascript
for (const v of [1, 2, 3, 4, 5]) {
	console.log(v);
	console.log(typeof v);
}
```

并且`for...of`支持`break`, `continue`操作.

接下来就是`for...in`.

其实`for...in`严格意义上来说是不能用于遍历数组的, 因为`for...in`是用于遍历可枚举属性.

像`Array`和`Object`使用内置构造函数所创建的对象都会继承自`Object.prototype`和`String.prototype`的不可枚举属性, 例如`String`的`indexOf()`方法或 `Object`的`toString()`方法。循环将遍历对象本身的所有可枚举属性，以及对象从其构造函数原型中继承的属性（更接近原型链中对象的属性覆盖原型属性）。--选自[for…in和for…of的用法与区别](https://segmentfault.com/a/1190000022348279)

如果你觉得上面这段话很难看懂的话可以不看的(<img src="https://gcore.jsdelivr.net/gh/sooooooooooooooooootheby/Emoji_Chest@v1.0.0/package/r1999/SothebyTehe.png" alt="SothebyTehe.png" class="emoji">

说到底`for...in`遍历的是**键**而不是**值**, 当你使用`for...in`时会返回一个字符串(无论原来的类型是什么, 返回的都是字符串).

下面这个例子会打印string, 说明返回的i的类型是字符串.

```javascript
for (const i in [1, 2, 3, 4, 5]) {
	console.log(typeof i);
}
```

因为js作为弱类型语言, 即使返回的是字符串, 但是你仍然可以用于数组.

下面这个例子仍然可以打印出数组中的元素, 但是不管从哪方面来说用`for...in`遍历数组都不合适.

```javascript
const a = [1, 2, 3, 4, 5, 6, 7];

for (const i in a) {
	console.log(a[i]);
}
```

这是一个正确例子用于遍历对象.

这个例子会打印出`a b c`, 这是对象b的键.

```javascript
const b = { a: 1, b: 2, c: 3 };

for (let i in b) {
	console.log(i);
}
```

一句话总结`for...of`和`for...in`就是: **for of是遍历(array)键值,for in是遍历(object)键名**

## .map()

```javascript
// item 为当前遍历到的值
// index 为索引
// array 为当前遍历的数组
array.map((item, index, array) => {});
```

`.map()`不会修改原有的数组, 会返回一个新的数组, 如果你需要映射数据可以使用这个方法.

下面这个例子对数组a进行+1操作然后赋值给数组b, 并且数组a不会有任何变化, 而b在a的基础上+1.

```javascript
const a = [1, 2, 3, 4, 5, 6];

const b = a.map((item) => {
	return (item += 1);
});

console.log(a); // [ 1, 2, 3, 4, 5, 6 ]
console.log(b); // [ 2, 3, 4, 5, 6, 7 ]
```

## .forEach()

```javascript
const a = [1, 2, 3, 4, 5, 6];

a.forEach((item, index, array) => {
	console.log(item);
	console.log(index);
	console.log(array);
});
```

`.forEach()`的三个参数用法和`.map()`是一样的, 但是`.forEach()`没有返回值, 用于修改元素, 或者发起请求.

## 总结

- 需要中断循环或复杂控制 → `for`
- 遍历对象属性 → `for...in`
- 简洁的数组遍历 → `for...of`
- 生成新数组 → `.map()`
- 仅执行操作, 无需新数组 → `.forEach()`

说了那么多, 其实日常开发使用`.map()` & `forEach()`即可<img src="https://gcore.jsdelivr.net/gh/sooooooooooooooooootheby/Emoji_Chest@v1.0.0/package/r1999/RegulusNanikore.png" alt="RegulusNanikore.png" class="emoji">
