---
title: 在 vercel 部署一个后端项目
pubDate: 2025-05-19T23:13:55+08:00
---

我最开始用 vercel 是因为没有服务器, 要挂博客只能用 vercel, 一直以来都把 vercel 当网站托管平台使.

今晚突发奇想想做个返回随机立绘的 api, 用 nodejs 写了一个后端, 只要请求就会返回一张立绘.

原本想放服务器跑的, 但是因为服务器理我太远了, 加上我是电脑连接手机的热点(众所周知苹果的信号差到爆炸), ssh 延迟巨高, 搞得我很难受, 突然想到 vercel 的部署好像有个`other`, 是不是可以用来跑一些后端?

所以尝试了一下, 还真可以.

---

首先我们需要准备好一个项目, 我这里使用了`express`跑的服务.

这是一个完整的 api 服务端示例, 具体作用就是读取目录下的文件然后请求就返回图片, 具体细节就不说了, 感兴趣自己看看.

```javascript
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const allowedOrigins = ["https://github.com/sooooooooooooooooootheby", "http://localhost", "http://127.0.0.1"];
const PORT = 3006;

const role = [];
const roleDir = path.resolve("./role");
function readDirRecursive(dir) {
	let results = [];
	const list = fs.readdirSync(dir);
	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat && stat.isDirectory()) {
			results = results.concat(readDirRecursive(filePath));
		} else {
			results.push(filePath);
		}
	});
	return results;
}
role.push(...readDirRecursive(roleDir));

const app = express();

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			} else {
				return callback(new Error("Not allowed by CORS"));
			}
		},
	})
);

app.get("/", async (req, res) => {
	const imageFiles = role.filter((file) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file));
	if (imageFiles.length === 0) {
		return res.status(404).send("No image files found.");
	}
	const randomIndex = Math.floor(Math.random() * imageFiles.length);
	const randomImagePath = imageFiles[randomIndex];
	res.sendFile(randomImagePath);
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
```

但是我们不能这么简单粗暴地写, 因为我们要适配 Vercel 的无服务器架构

所以在根目录下创建一个目录和文件`/api/index.js`, 这个文件将写入我们的代码逻辑, 并将`express`实例导出.

```javascript
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();

const allowedOrigins = ["https://github.com/sooooooooooooooooootheby", "http://localhost", "http://127.0.0.1"];

const role = [];
const roleDir = path.resolve("./role");

function readDirRecursive(dir) {
	let results = [];
	const list = fs.readdirSync(dir);
	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat && stat.isDirectory()) {
			results = results.concat(readDirRecursive(filePath));
		} else {
			results.push(filePath);
		}
	});
	return results;
}

role.push(...readDirRecursive(roleDir));

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			} else {
				return callback(new Error("Not allowed by CORS"));
			}
		},
	})
);

app.get("/", async (req, res) => {
	const imageFiles = role.filter((file) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file));
	if (imageFiles.length === 0) {
		return res.status(404).send("No image files found.");
	}
	const randomIndex = Math.floor(Math.random() * imageFiles.length);
	const randomImagePath = imageFiles[randomIndex];
	res.sendFile(randomImagePath);
});

// 必须导出为模块而不是监听端口
export default app;
```

然后在根目录创建`vercel.json`, 这个是 vercel 的配置文件.

```json
{
	"version": 2,
	"builds": [
		{
			"src": "api/index.js",
			"use": "@vercel/node"
		}
	],
	"routes": [
		{
			"src": "/(.*)",
			"dest": "api/index.js"
		}
	]
}
```

主要内容在`routes`, 作用是告诉 vercel 如果请求`/`就使用`/api/index.js`下的`express`实例.

如果你不这么写, 只是单纯地上传一个`api.js`和`package.json`, 尽管 vercel 可以部署成功,但是当你访问`/`时会出现 404 报错.

---

现在我们把项目上传到 github, 再打开 vercel 部署即可.

因为vercel在识别不出项目的类型时会直接选择`other`, 我们直接部署即可.

![1](https://image.meorion.moe/image/vercelBackEnd/1.webp)

等待部署完成后打开就能看到返回的图片了.

![2](https://image.meorion.moe/image/vercelBackEnd/2.webp)
