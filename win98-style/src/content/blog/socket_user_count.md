---
title: 站点实时在线人数
pubDate: 2024-09-18T20:25:10+08:00
updatedDate: 2024-11-06T14:06:40+08:00
---

前段时间刷视频看到了 Mix Space 项目, 好奇逛了一下, 发现页脚的实时在线人数还挺有意思, 刚好最近在重新设计博客的前后端, 就试了一下, 也成功在自己的博客实现了实时在线人数显示.

![1.webp](https://image.meorion.moe/image/socket_user_count/1.webp)

## 技术原理

看 Mix Space 页脚的说明可以知道用的是 `WebSocket` 技术, 所以这里我使用的是 `socket.io` 库, 稍微跟着官网的教程学一下大概就能明白是怎么实现的了.

在客户端渲染页面的时候会自动建立 `WebSocket` 连接, 服务端会在成功建立连接时记录当前连接的客户端数量, 并且 `socket.io` 库提供了一个 [api-engine.clientsCount](https://socket.io/zh-CN/docs/v4/server-api/#engineclientscount) 用于返回连接的客户端数量.

```javascript
const count = io.engine.clientsCount;
```

## 实现

因为我对更深层的技术也不太了解, 所以就以代码为主, 不写一些全双工,长轮询之类的复杂原理.

这里我用的后端是 `node.js`, `node.js` 已经能够满足我的需求了, 所以我也不追求一些更高级的编程语言写的后端了.

### 在原有的后端加入 socket.io

安装:

```shell
pnpm add socket.io
```

我这里将 `socket` 相关的代码全部独立出来作为一个文件, 所以正常流程会和官网的文档有些出入.

```javascript
// main.js
// 创建 express 实例
import express from "express";
const service = express();

// 创建Socket实例
// 这里的 ./socket.js 是我们配置 socket 的文件, 需要我们自己手动建
// 在 main.js 创建的实例只是相当于导入了一个配置文件给 express 实例使用
import { createSocketServer } from "./socket.js";
const server = createSocketServer(service);
```

```javascript
// socket.js
// 导入依赖
import { createServer } from "node:http";
import { Server } from "socket.io";

export function createSocketServer(service) {
	// 创建服务器实例
	const server = createServer(service);
	// 配置端口和跨域, 如果不配置端口会和 express 的实例共用一个端口, 不过我不知道为什么如果我不配置就会导致无法连接到 socket
	const io = new Server(3333, {
		cors: {
			origin: "*",
		},
	});

	// 当客户端连接时
	io.on("connection", (socket) => {
		// 给客户端发送有多少人在线
		io.emit("user count", io.engine.clientsCount);

		// 有客户端离线时
		socket.on("disconnect", () => {
			io.emit("user count", io.engine.clientsCount);
		});
	});

	return server;
}
```

### 在前端配置 socket

安装:

```shell
pnpm add socket.io-client
```

```javascript
// 在 main.js 创建实例
import { io } from "socket.io-client";
const socket = io("127.0.0.1:3333");
// 这里将 socket 的实例全局挂载, 方便我们在其他组件调用 socket
app.config.globalProperties.$socket = socket;
```

```javascript
// 在组件中配置事件
export default {
	data() {
		return {
			// socket连接状态
			isSocket: false,
			// 当前连接人数
			userCount: "?",
		};
	},
	mounted() {
		// 负责接收连接人数
		this.$socket.on("user count", (count) => {
			this.userCount = count;
		});
		// 连接成功时
		this.$socket.on("connect", () => {
			this.isSocket = true;
		});
		// 断开连接时
		this.$socket.on("disconnect", () => {
			this.isSocket = false;
		});
	},
};
```

### 反向代理

这里顺便说一下放进服务器里面运行, 因为我的服务器配置了 `Nginx` , 所以当时我把功能上线的时候遇到了很多问题, 例如 `400` 或者 `500` , 看了官方文档才知道使用反代需要特殊配置才能使用.

我为了方便, 避免在开发环境和生产环境切换的时候反复手动修改, 用到了环境变量.

#### 后端

`SOCKET_PATH`留空是因为在反代中我需要自定义路径, 如果不需要自定义路径可以不使用 PATH.

```javascript
// .env.development
// 开发环境
SOCKET_PATH = SOCKET_PORT = 3333;

// .env.production
SOCKET_PATH = /socket/;
SOCKET_PORT = 3333;

// socket.js
import * as dotenv from "dotenv";
dotenv.config();
// 程序会根据情况自动切换使用对应端口
const path = process.env.SOCKET_PATH || "";
const port = process.env.SOCKET_PORT || 3333;

const io = new Server(port, {
	path: path,
	cors: {
		// * 是通配符, 为了安全建议修改成自己的站点
		/* 例如我的修改为origin:
        ["http://192.168.31.111:5173", "https://blog.sooooooooooooooooootheby.top/"]
        前面的是开发环境的, 后面的是生产环境的
        */
		origin: "*",
	},
});
```

`nginx`的具体配置可以见[官方文档](https://socket.io/zh-CN/docs/v4/reverse-proxy/).

下面的配置文件只需要修改端口号.

```nginx
location /socket/ {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;

        // 这里端口号需要修改为你自己配置的 socket 的端口号
        proxy_pass http://127.0.0.1:3333;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
}
```

#### 前端

```javascript
// .env.development
VITE_SOCKET_URL=192.168.31.111:3579
VITE_SOCKET_PATH=/socket/

// .env.production
VITE_SOCKET_URL=
VITE_SOCKET_PATH=/socket/

// main.js
import { io } from "socket.io-client";
const socketUrl = import.meta.env.VITE_SOCKET_URL;
const socketPath = import.meta.env.VITE_SOCKET_PATH;
const socket = socketUrl ? io(socketUrl) : io({ path: socketPath });
app.config.globalProperties.$socket = socket;
```

> 至于程序是怎么做到自动切换的, 我也不知道, 问问 GPT:
>
> 自动切换开发环境和生产环境的环境变量依赖于 `process.env` 对象的行为，这是 `Node.js` 和许多构建工具(如 Vite、Webpack)支持的一个功能, 用来根据不同的运行环境加载相应的环境变量。
>
> 原理：
>
> `process.env` 是一个存储环境变量的对象。不同的环境(例如开发环境和生产环境)可以通过不同的环境变量配置文件来设置不同的值，从而让代码自动适应这些环境。
>
> 在开发环境和生产环境中，通常使用不同的环境变量文件，例如：
>
> - 开发环境：使用 .env.development
> - 生产环境：使用 .env.production
>
> 构建工具 (如 Vite、Webpack) 会根据你运行的命令 (比如 npm run serve、npm run build) 选择对应的环境文件, 并将其中的变量注入到 process.env 中.
