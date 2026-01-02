---
pid: 3
title: The role of the <template> tag in vue
date: 2025-10-28T10:11:32.000Z
sort: front-end
---

I always thought that `<template>` was only used to wrap the html tags of components, but today I found out that this thing can actually be used as a logical packaging tag.

In vue docs [Built-in Special Elements](https://vuejs.org/api/built-in-special-elements.html#template), "The `<template>` tag is used as a placeholder when we want to use a built-in directive without rendering an element in the DOM" is mentioned.

It might sound confusing. To put it in one sentence: If you want to use some vue directives, such as `v-for` and `v-if`, you can use `<template>` as a virtual container. It won't be rendered in the actual DOM tree, thus avoiding the generation of meaningless `div`.

For example, in the following situation, I need to use `v-for` and `v-if` to render the `<li>` tag.

```html
<ul>
	<li v-for="child in item.children" :key="child.path" v-if="!child.isHide">
		<NuxtLink :to="child.path" class="is-drawer-close:hidden" :class="{ 'menu-active': child.path === route.path }"> {{ child.title }} </NuxtLink>
	</li>
</ul>
```

If I write it this way, although it won't generate additional containers like `div`, `v-if` will report an error because `v-for` and `v-if` cannot be at the same level, which will lead to an error in priority.

Then I can only write it

```html
<ul>
	<li v-for="child in item.children" :key="child.path" v-if="!child.isHide">
		<div v-if="!child.isHide">
			<NuxtLink :to="child.path" class="is-drawer-close:hidden" :class="{ 'menu-active': child.path === route.path }"> {{ child.title }} </NuxtLink>
		</div>
	</li>
</ul>
```

Although this way of writing is not harmful, but in the DOM tree, there will be a meaningless `div`, which is not what we want. This time we can use `<template>` to wrap the `<li>` tag.

So, even if there is an extra layer of `<template>` in the code, it won't be rendered in the actual DOM tree.

```html
<ul>
	<template v-for="child in item.children" :key="child.path">
		<li v-if="!child.isHide">
			<NuxtLink :to="child.path" class="is-drawer-close:hidden" :class="{ 'menu-active': child.path === route.path }"> {{ child.title }} </NuxtLink>
		</li>
	</template>
</ul>
```
