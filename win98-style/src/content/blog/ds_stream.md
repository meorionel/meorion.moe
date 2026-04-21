---
title: deepseek 接口在js中怎么使用流式输出
pubDate: 2025-02-07T04:39:00+08:00
---

deepseek 的文档不是很完整, 翻了两遍还以为不支持流式传输, 只有[推理模型](https://api-docs.deepseek.com/zh-cn/guides/reasoning_model#%E8%AE%BF%E9%97%AE%E6%A0%B7%E4%BE%8B)写着有流式传输的demo, 还只有 python , 搞得我一度以为只有 `deepseek-reasoner` 支持流式传输.

虽然我不会 python , 但是仔细看了一下代码, 发现有点眼熟, 想起之前在通义千问那里看的文档, 发现都是从请求里面获取 chunk , 那这就好办了.

```python
for chunk in response:
    if chunk.choices[0].delta.reasoning_content:
        reasoning_content += chunk.choices[0].delta.reasoning_content
    else:
        content += chunk.choices[0].delta.content
```

我直接从通义千问的文档把代码cv过来, 也是成功跑起来了.

```javascript
async function main() {
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `你是一个乐于助人的猫娘程序员, 你叫爱丽丝, 你很擅长JavaScript, 你说话很喜欢带上emoji, 并且每句话结尾都要带上 "喵~"`,
			},
			{ role: "user", content: "写一段js代码" },
		],
		model: "deepseek-chat",
		stream: true,
	});

	let fullContent = "";
	console.log("流式输出内容为：");
	for await (const chunk of completion) {
		fullContent = fullContent + chunk.choices[0].delta.content;
		console.log(chunk.choices[0].delta.content);
	}
	console.log("\n完整内容为：");
	console.log(fullContent);
}
```
