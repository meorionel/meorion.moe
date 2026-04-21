---
title: 关于 vue 中 <template> 标签的作用
pubDate: 2025-10-28T10:11:32.000Z
---

一直以为 `<template>` 只是用于包裹组件html的标签, 但是今天才发现, 原来这个东西可以作为一个逻辑性的包装标签使用.

在 vue 文档的[内置特殊元素](https://cn.vuejs.org/api/built-in-special-elements.html#template)中提到"当我们想要使用内置指令而不在 DOM 中渲染元素时，`<template>` 标签可以作为占位符使用。", 听起来可能会很绕, 用一句话来说就是: 如果你想用一些vue的指令, 例如 `v-for`, 可以使用 `<template>` 作为一个虚拟的虚拟容器, 在实际的DOM树中并不会被渲染, 这样可以避免生成无意义的`div`.

比如下面的情况, 我需要使用 `v-for` 和 `v-if` 去渲染 `<li>` 标签.

```html
<ul>
	<li v-for="child in item.children" :key="child.path" v-if="!child.isHide">
		<NuxtLink :to="child.path" class="is-drawer-close:hidden" :class="{ 'menu-active': child.path === route.path }"> {{ child.title }} </NuxtLink>
	</li>
</ul>
```

如果我这么写, 虽然他不会产生额外的 `div` 之类的容器, 但是 `v-if` 会报错, 因为 `v-for` 和 `v-if` 不能处于同一层, 会导致优先级上的错误.

那我只能写成

```html
<ul>
	<li v-for="child in item.children" :key="child.path" v-if="!child.isHide">
		<div v-if="!child.isHide">
			<NuxtLink :to="child.path" class="is-drawer-close:hidden" :class="{ 'menu-active': child.path === route.path }"> {{ child.title }} </NuxtLink>
		</div>
	</li>
</ul>
```

虽然这么写无伤大雅, 但是在DOM树中会出现一个没有任何意义的`div`, 这个时候我们就可以使用 `<template>`.

这样, 即使在代码中会多一层 `<template>`, 但是到了实际的DOM树中并不会多渲染一个元素出来.

```html
<ul>
	<template v-for="child in item.children" :key="child.path">
		<li v-if="!child.isHide">
			<NuxtLink :to="child.path" class="is-drawer-close:hidden" :class="{ 'menu-active': child.path === route.path }"> {{ child.title }} </NuxtLink>
		</li>
	</template>
</ul>
```
