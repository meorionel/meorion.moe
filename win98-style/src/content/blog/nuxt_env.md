---
title: nuxt3 配置环境变量
pubDate: 2025-02-06T09:23:09+08:00
---

一般在编写 node.js 程序时, 我们会使用 process.env 获取包含了当前 Shell 的所有环境变量, 而在 nuxt3 中, 虽然同样也可以通过 process.env 获取环境变量, 但只有服务端能获取到.

```javascript
// app.vue
console.log(process.env.SERVER);
```

所以 nuxt3 提供了 [`runtimeConfig`](https://nuxt.com/docs/api/nuxt-config#runtimeconfig-1) 将环境变量, 以及一些你需要设置的全局变量传递到 Nuxt 应用的上下文.

## 使用

> The value of this object is accessible from server only using useRuntimeConfig. It mainly should hold private configuration which is not exposed on the frontend. This could include a reference to your API secret tokens. Anything under public and app will be exposed to the frontend as well. Values are automatically replaced by matching env variables at runtime, e.g. setting an environment variable NUXT_API_KEY=my-api-key NUXT_PUBLIC_BASE_URL=/foo/ would overwrite the two values in the example below.
>
> 该对象的值只能通过 useRuntimeConfig 在服务端访问。它主要用于保存不暴露给前端的私有配置，例如 API 密钥等敏感信息。任何定义在 public 或 app 下的配置会被同时暴露给前端。这些值在运行时会自动替换为匹配的环境变量。例如，设置环境变量 NUXT_API_KEY=my-api-key 和 NUXT_PUBLIC_BASE_URL=/foo/ 将会覆盖下方示例中的两个值。

上面是官方文档的原文, 意思是我们通过 `runtimeConfig` 设置了变量之后, 需要通过 `useRuntimeConfig` 访问, 将我们需要的内容暴露在全局, 并且可以手动控制哪些内容暴露在前端, 哪些不暴露在前端.

如果直接将变量写在 `runtimeConfig` 内只能在服务端访问, 如果写在 `public` 和 `app` 内就可以暴露到前端(客户端).

```javascript
// nuxt.config.ts
runtimeConfig: {
    server1: "server",
    public: {
        client1: "client1",
    },
    app: {
        client2: "client2",
    },
},

// app.vue
const config = useRuntimeConfig();
console.log(config.app);
console.log(config.public);
console.log(config.server1);
```

上面我们打印了`app``public`和`server1`, 可以看到 `config.server1` 是 `undefined`, 这意味着客户端无法获取这个变量.

## runtimeConfig 和 process 的区别

| runtimeConfig                                                     | process.env                                                           |
| ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| 分为 public（客户端可见）和 private（仅服务端）两部分，默认安全。 | 需要手动控制哪些变量暴露给客户端，存在误暴露风险。                    |
| 服务端变量通过 Nitro 注入，不会泄漏到客户端。                     | 若直接在客户端代码中使用 process.env.SECRET_KEY，会导致敏感信息泄漏。 |

|                  | `runtimeConfig`                | `process.env`                          |
| ---------------- | ------------------------------ | -------------------------------------- |
| **默认安全性**   | ⭐️ 高（自动隔离客户端/服务端） | ⚠️ 需手动管理（如使用 VITE\_ 前缀）    |
| **配置灵活性**   | ✅ 集中式配置，类型安全        | ⚠️ 需依赖构建工具规则（如 Vite/Nitro） |
| **服务端兼容性** | 🔧 完美集成 Nitro              | ⚠️ 需注意 NITRO\_ 前缀规则             |
| **开发体验**     | ✨ 类型提示和自动补全          | 🔨 依赖外部工具或额外类型定义          |
