---
title: "[转载]Nuxt3集成Ant design 组件库"
pubDate: 2024-12-27T20:25:10+08:00
updatedDate: 2024-12-28T14:06:40+08:00
---

> 转载自[稀土掘金](https://juejin.cn/post/7187644007252492345)

大家好，我是地方地方，一只想变得更好的菜鸟。

这些天开始学习Nuxt, 找了一圈都没有找到在项目中集成Ant design vue, 也可能是我找的方法不对，后面参考别的组件引入成功的实现了组件的集成。为了避免有和我一样的小伙伴，所以把我的方法贴出来。

1. 首先第一件事肯定就依赖的安装

```sh
pnpm --save ant-design-vue
```

2. 在plugins文件中新建ant-design-vue.js(以插件方式加载)

```js
// 1. 引入组件
import Antd from "ant-design-vue";
// 2. 引入组件样式
import "ant-design-vue/dist/antd.css";
// 3. 注册
export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(Antd);
});
```

3. 然后就在页面中使用组件并查看效果了

![效果](https://image.meorion.moe/image/nuxt_ant_auto_import/1.webp)
