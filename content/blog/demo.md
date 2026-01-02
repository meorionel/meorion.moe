---
pid: 0
title: Markdown Syntax Examples
date: 2025-01-02T14:16:27+08:00
sort: demo
---

## 1. Text Formatting

Markdown allows you to write using an easy-to-read, easy-to-write plain text format, which is then converted into valid XHTML. You can use **bold** for emphasis, *italics* for subtle nuance, or ~~strikethrough~~ to represent deleted text.

You can also highlight `inline code` within a sentence to refer to variables or filenames.

---

## 2. Quotes and Lists

> "The most dangerous phrase in the language is, 'We've always done it this way.'" — Grace Hopper

Here is an unordered list of fruits:

- Apple
- Banana
- Cherry

Here is an ordered list of steps:

1. Install dependencies
2. Run the build script
3. Deploy to the server

---

## 3. GitHub Flavored Markdown (GFM)

### Code Blocks

GitHub supports syntax highlighting for specific languages. Here is a TypeScript example:

```typescript
interface User {
	id: number;
	name: string;
}

function greet(user: User): string {
	return `Hello, ${user.name}!`;
}

```

Adding filenames and highlighting lines:

```ts [app.config.ts] {1,3-5}
export default defineAppConfig({
	title: "Hello Nuxt",
	theme: {
		dark: true,
		colors: { primary: "#ff0000" },
	},
});

```

### Task Lists

This is a task list, commonly used to track progress in Issues or Pull Requests.

* [x] Create the project structure
* [x] Write the initial documentation
* [ ] Fix the styling bugs
* [ ] Release version 1.0

### Tables

Tables are excellent for organizing data. Note that colons indicate the alignment.

| Command | Description | Alignment |
| --- | --- | --- |
| `git status` | Check file status | Left |
| `git commit` | Save changes | Center |
| `git push` | Upload to remote | Right |

---

## 4. Links and Images

To learn more about the syntax, please visit the [GitHub Markdown Guide](https://docs.github.com/en/get-started/writing-on-github).

*(This is an example of an image embedded in the document)*

---

### 💡 Core Syntax Cheat Sheet

To help you remember, here is a summary of the core symbols used above:

1. **Headings**: `#` (H1), `##` (H2)
2. **Bold/Italic**: `**Bold**`, `*Italic*`
3. **Quotes**: `> Text`
4. **Lists**: `- Item` (Unordered), `1. Item` (Ordered)
5. **Code Blocks**: Wrap with three backticks ```
6. **Task Lists**: `- [ ]` (Incomplete), `- [x]` (Complete)
7. **Tables**: Use `|` to separate columns and `-` to separate the header
8. **Links**: `[Display Text](Link Address)`
