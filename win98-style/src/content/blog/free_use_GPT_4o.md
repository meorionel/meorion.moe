---
title: 白嫖GPT 4o key
pubDate: 2025-01-07T15:42:14+08:00
---

![cover](https://image.meorion.moe/image/free_use_GPT_4o/cover.webp)

这里白嫖的是Github的GPT, 并不是OpenAI的。

# 获取key

打开[Github](https://github.com/marketplace/models/azure-openai/gpt-4o), 点击右上角的`Get API key`, 打开窗口后点击`Get developer key`获取你的Github key.

![1.webp](https://image.meorion.moe/image/free_use_GPT_4o/1.webp)

跳转到新的页面后点击`Generate new token`, 这里我们选择classic(说实话我也不知道这两个有什么区别, 就选择一般用途的).

![2.webp](https://image.meorion.moe/image/free_use_GPT_4o/2.webp)

点击后会跳转到一个页面, 让你给`key`命名, 以及设置有效期, 有效期我直接设置无限, 我懒得之后再更新, 下面的权限一个都不需要添加.

获取到`key`后保存好, 之后需要通过`key`来验证身份。

# 初始化项目

初始化一个`node.js`项目, 修改`package.json`文件, 我们需要使用ES6语法, 这是`openai`依赖要求的.

```json
{
	"type": "module"
}
```

安装依赖

```bash
pnpm i openai
```

新建一个`sample.js`文件, 将下面的代码复制进去, 并修改`token`为你刚刚获取的`key`.

```javascript
import OpenAI from "openai";

const token = ""; // 这里是你的key
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

export async function main() {
	const client = new OpenAI({ baseURL: endpoint, apiKey: token });

	const stream = await client.chat.completions.create({
		messages: [
			{ role: "system", content: "你是一个乐于助人的ai助手" },
			{ role: "user", content: "给我五个需要学习的理由" },
		],
		model: modelName,
		stream: true,
	});

	for await (const part of stream) {
		process.stdout.write(part.choices[0]?.delta?.content || "");
	}
	process.stdout.write("\n");
}

main().catch((err) => {
	console.error("The sample encountered an error:", err);
});
```

在终端执行`node sample.js`就能看到ai的回答了.

![3.webp](https://image.meorion.moe/image/free_use_GPT_4o/3.webp)

# 优化代码

当然, 我们刚刚的操作并不健康, 例如直接把`key`放进代码, 如果你把它上传到了Github之类的地方会导致你的`key`泄露, 这是很危险的, 以及固定的用户输入.

对于`key`, 一般设置为环境变量.

如果你使用bash:

```bash
export GITHUB_TOKEN="<你的key>"
```

如果你使用powershell:

```power
$Env:GITHUB_TOKEN="<你的key>"
```

如果你使用windows的cmd:

```bash
set GITHUB_TOKEN=<你的key>
```

或者你可以写一个`.env`环境变量文件在你的项目里面:

```env
KEY =  # 这里写你的key, 不需要使用引号
```

安装`dotenv`并修改一下代码:

```bash
pnpm i dotenv
```

```javascript
import OpenAI from "openai";
import "dotenv/config";

const token = process.env.KEY;  # 修改从.env获取
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

export async function main() {
    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    const stream = await client.chat.completions.create({
        messages: [
            { role: "system", content: "你是一个乐于助人的ai助手" },
            { role: "user", content: process.argv.slice(2)[0] },  # 修改输入从命令行获取
        ],
        model: modelName,
        stream: true,
    });

    for await (const part of stream) {
        process.stdout.write(part.choices[0]?.delta?.content || "");
    }
    process.stdout.write("\n");
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
});
```

接着我们输入命令就能看到ai的回答了:

```bash
node sample.js 下午好
```

![4.webp](https://image.meorion.moe/image/free_use_GPT_4o/4.webp)
