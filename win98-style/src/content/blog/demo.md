---
title: Markdown 语法示例
pubDate: 2025-12-17T15:45:57+08:00
---

## 1. 文本格式化

Markdown 允许你使用易读易写的纯文本格式进行写作，然后将其转换为有效的 XHTML。你可以使用**粗体**表示强调，使用*斜体*表示细微差别，或者使用~~删除线~~来表示删除的文本。

你还可以在句子中高亮显示 `行内代码`，用来指代变量或文件名。

---

## 2. 引用与列表

> “语言中最危险的一句话是：‘我们一直都是这么做的。’”——格蕾丝·赫柏

这是一个无序的水果列表：

- 苹果
- 香蕉
- 樱桃

这是一个有序的步骤列表：

1.  安装依赖
2.  运行构建脚本
3.  部署到服务器

---

## 3. GitHub 特有语法 (GFM)

### 代码块

GitHub 支持特定语言的语法高亮。这是一个 TypeScript 示例：

```typescript
interface User {
	id: number;
	name: string;
}

function greet(user: User): string {
	return `Hello, ${user.name}!`;
}
```

添加文件名和高亮行

```ts [app.config.ts] {1,3-5}
export default defineAppConfig({
	title: "Hello Nuxt",
	theme: {
		dark: true,
		colors: { primary: "#ff0000" },
	},
});
```

### 任务列表

这是一个任务列表，通常用于跟踪 Issue 或 Pull Request 中的进度。

- [x] Create the project structure
- [x] Write the initial documentation
- [ ] Fix the styling bugs
- [ ] Release version 1.0
- [x] 创建项目结构
- [x] 编写初始文档
- [ ] 修复样式 Bug
- [ ] 发布 1.0 版本

### 表格

表格非常适合组织数据。请注意冒号表示对齐方式。

| Command      | Description       | Alignment |
| ------------ | ----------------- | --------- |
| `git status` | Check file status | Left      |
| `git commit` | Save changes      | Center    |
| `git push`   | Upload to remote  | Right     |

| 命令         | 描述         | 对齐方式 |
| ------------ | ------------ | -------- |
| `git status` | 检查文件状态 | 左对齐   |
| `git commit` | 保存更改     | 居中     |
| `git push`   | 上传到远程   | 右对齐   |

---

## 4. 链接与图片

要了解有关语法的更多信息，请访问 [GitHub Markdown 指南](https://docs.github.com/en/get-started/writing-on-github)。

_(这是嵌入文档中的图片示例)_

![](https://pic1.imgdb.cn/item/6892135758cb8da5c806ff66.png)

---

### 💡 核心语法速查表

为了方便你记忆，这里总结了上面用到的核心符号：

1.  **标题**: `#` (一级), `##` (二级)
2.  **粗体/斜体**: `**粗体**`, `*斜体*`
3.  **引用**: `> 文字`
4.  **列表**: `- 项目` (无序), `1. 项目` (有序)
5.  **代码块**: 使用三个反引号 \`\`\` 包裹
6.  **任务列表**: `- [ ]` (未完成), `- [x]` (已完成)
7.  **表格**: 使用 `|` 分隔列，使用 `-` 分隔表头
8.  **链接**: `[显示文本](链接地址)`
