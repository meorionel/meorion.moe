---
title: 教你写一个简单的终端主题
pubDate: 2025-10-21T08:16:11+08:00
---

前两天才想起 **oh my posh** 支持 `windowss` `Mac` `Linux`, 而且我觉得 **oh my posh** 自带的主题要比 **oh my zsh** 和 **oh my bash** 的好看.

花了点时间把 Mac 的 **oh my zsh** 换成 **oh my posh**, 翻了一下主题列表, 发现都不是很满意, 打开主题文件, 研究了一下发现还挺简单, 就算不看文档也能看懂.

于是我花了半个下午根据文档写了个主题.

![posh theme](https://image.meorion.moe/image/ohmyposh/1.webp)

---

安装就不说了, 很简单的, 一条命令就可以了, Mac 上安装可能会卡在 `go build`, 直接用脚本安装就可以了.

```bash
curl -s https://ohmyposh.dev/install.sh | bash -s
```

---

**oh my posh** 基于块来显示终端的, 所以你只需要通过简单的块来搭建即可.

主题文件默认是 `json` 同时也支持 `toml` `yaml`, 这里用 `json` 因为我觉得json的结构性更强, 看起来更轻松.

下面是一个空白的主题文件, 当你使用这个空白的主题时你的终端只会显示光标和你输入的指令, 不会有其他任何的东西.

```json
{
	"$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
	"version": 3,
	"blocks": []
}
```

稍微解释一下上面各个配置的作用.

- "$schema": 指向一个在线 JSON schema, 用于验证配置文件的语法正确性, 提供智能提示和错误检查(不是什么特别重要的东西, 不要动它就好了).
- "version": 配置版本, 不要动它就好了.
- "blocks": 块, 我们写的主题将在这里实现.

除去上面的配置, 还有一些其他的配置, 例如:

- final_space: 是否需要在命令前添加一个空格
- maps: 添加自定义文本映射, 例如检测到 root 用户, 会将负责用户显示的变量替换为你自定义的文本.
- palette: 调色板, 你可以添加一些预设的颜色.

具体的你可以查看[文档](https://ohmyposh.dev/docs/configuration/general#settings)

---

现在我们来上手写一个简单的主题(文章末尾会有完整的配置文件, 你不需要担心某个片段应该添加在哪)

先添加一个调色盘, 这可以帮助我们规范颜色, 我这里使用的都是 tailwindcss 里的颜色.

```json
"palette": {
	"rose": "#F7CFD3",
	"sky": "#C1E5FC",
	"violet": "#DCD7FC",
	"green": "#B6F1D2",
	"gray": "#E6E7EB"
},
```

下面是一个块级的选项, 需要添加到 `blocks` 数组中, 在这个块级里面有两个关键的选项:

- alignment: 位置 只能填写 `left` 或 `right`
- type: 必须保留的选项 填写 `prompt` 或 `rprompt` (填写 rprompt 时块会显示在右边)
- segments: 段落, 一个块中又有多个段落.
    - foreground: 调色盘, 使用 `p:` + 上面你预设的颜色名即可
    - style: 样式 可填写 powerline、plain、diamond、accordion
    - template: 显示内容的模版
    - type: 类型 可填写多种类型, 因为太多了, 不是一句两句能说明白的, 具体查看[文档](https://ohmyposh.dev/docs/segments/system/text)

```json
{
	"alignment": "left",
	"type": "prompt",
	"segments": [
		{
			"foreground": "p:rose",
			"style": "plain",
			"template": "{{ .UserName }}@{{ .HostName }}",
			"type": "text"
		},
		{
			"foreground": "p:violet",
			"style": "plain",
			"template": " \uf178",
			"type": "text"
		}
	]
}
```

模版中双花括号中的是变量(或许可以这么理解, 有点像vue).

下面是通用的变量, 根据段内的 `type` 不同, 变量也有更多的选择.

| 名称            | 类型      | 描述                                                |
| --------------- | --------- | --------------------------------------------------- |
| `.Root`         | `boolean` | 当前用户是否为 root/admin                           |
| `.PWD`          | `string`  | 当前工作目录 ($HOME 目录显示为 ~)                   |
| `.AbsolutePWD`  | `string`  | 当前工作目录 (未修改的原始路径)                     |
| `.PSWD`         | `string`  | PowerShell 中当前的非文件系统工作目录               |
| `.Folder`       | `string`  | 当前工作文件夹                                      |
| `.Shell`        | `string`  | 当前 shell 名称                                     |
| `.ShellVersion` | `string`  | 当前 shell 版本                                     |
| `.SHLVL`        | `int`     | 当前 shell 级别                                     |
| `.UserName`     | `string`  | 当前用户名称                                        |
| `.HostName`     | `string`  | 主机名                                              |
| `.Code`         | `int`     | 最后一个退出代码                                    |
| `.Jobs`         | `int`     | 后台作业的数量 (仅 zsh、PowerShell 和 Nushell 可用) |
| `.OS`           | `string`  | 操作系统                                            |
| `.WSL`          | `boolean` | 是否在 WSL 中                                       |
| `.Templates`    | `string`  | 模板结果                                            |
| `.PromptCount`  | `int`     | 提示符计数器，每次调用提示符时递增 1                |
| `.Version`      | `string`  | Oh My Posh 版本                                     |
| `.Segment`      | `Segment` | 当前片段的元数据                                    |

模版中的 `\uf178` 是一个 Unicode 转义序列, 会被渲染成一个图标, 你可以在[这里](https://www.nerdfonts.com/cheat-sheet)搜索你想要的图标, 把鼠标放到图标上点击 **UTF** 就可以复制对于的代码.

> 注意, 你需要安装并设置终端的字体为 **Nerd Fonts** 系列的字体才能正常显示图标, 这也是你在安装 **oh my posh** 时要求你做的.

现在假设你想要换行让命令输入在第二行, 你可以直接添加一个 `\n`, 这样, 命令输入就会跳到第二行了.

```json
{
	"foreground": "p:rose",
	"style": "plain",
	"template": "{{ .UserName }}@{{ .HostName }} \n",
	"type": "text"
}
```

---

现在我想要在右边显示内存使用信息, 可以添加下面的块.

这个内存显示我是从其他的主题文件里面 cv 来的, 所以我也不知道这里面的变量代表什么意思(

如果你看到其他人的主题中有你想要的东西, 不妨大胆地去看看它的源码, 然后 cv 过来, 只要代码在你的文件里面, 那就是你的代码了!

```json
{
	"alignment": "right",
	"type": "prompt",
	"segments": [
		{
			"foreground": "p:sky",
			"style": "diamond",
			"template": "{{ round .PhysicalPercentUsed .Precision }}% [ {{ (div ((sub .PhysicalTotalMemory .PhysicalAvailableMemory)|float64) 1073741824.0) }}/{{(div .PhysicalTotalMemory 1073741824.0) }}GB ]",
			"type": "sysinfo"
		}
	]
}
```

接下来我们加个 github 的状态.

当然, 这也是我 cv 来的, 我也不知道这些都是什么, 反正可以正常显示就对了!

```json
{
	"foreground": "p:rose",
	"properties": {
		"branch_icon": "\ue725 ",
		"fetch_status": true,
		"fetch_upstream_icon": true,
		"fetch_worktree_count": true
	},
	"style": "diamond",
	"template": " {{ .HEAD }}{{if .BranchStatus }} {{ .BranchStatus }}{{ end }}{{ if .Working.Changed }} \uf044 {{ .Working.String }}{{ end }}{{ if and (.Working.Changed) (.Staging.Changed) }} |{{ end }}{{ if .Staging.Changed }} \uf046 {{ .Staging.String }}{{ end }}{{ if gt .StashCount 0 }} \ueb4b {{ .StashCount }}{{ end }} ",
	"type": "git"
}
```

最后我们再加一个路径显示在第二行.

这就是 `type` 不同带来更多的设置, 例如这里是 `path`, 那就可以根据 `path` 的类型添加更多[配置](https://ohmyposh.dev/docs/segments/system/path)

```json
{
	"alignment": "left",
	"type": "prompt",
	"segments": [
		{
			"foreground": "p:violet",
			"leading_diamond": "<#DCD7FC>{</>",
			"properties": {
				"folder_icon": "\uf07b", // 文件夹图标 (Font Awesome)
				"folder_separator_icon": " \uebcb ", // 路径分隔符图标
				"home_icon": "home", // 家目录显示为 "home"
				"style": "agnoster_full" // 使用 agnoster 完整路径样式
			},
			"style": "diamond",
			"template": " \ue5ff {{ .Path }} ",
			"trailing_diamond": "<#DCD7FC>}</> \uf178",
			"type": "path"
		}
	]
}
```

---

![](https://image.meorion.moe/image/ohmyposh/2.webp)

完整的代码如下:

```json
{
	"$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
	"version": 3,
	"final_space": true,
	"palette": {
		"rose": "#F7CFD3",
		"sky": "#C1E5FC",
		"violet": "#DCD7FC",
		"green": "#B6F1D2",
		"gray": "#E6E7EB"
	},
	"blocks": [
		{
			"alignment": "left",
			"type": "prompt",
			"segments": [
				{
					"foreground": "p:rose",
					"style": "plain",
					"template": "{{ .UserName }}@{{ .HostName }}",
					"type": "text"
				},
				{
					"foreground": "p:rose",
					"properties": {
						"branch_icon": "\ue725 ",
						"fetch_status": true,
						"fetch_upstream_icon": true,
						"fetch_worktree_count": true
					},
					"style": "diamond",
					"template": " {{ .HEAD }}{{if .BranchStatus }} {{ .BranchStatus }}{{ end }}{{ if .Working.Changed }} \uf044 {{ .Working.String }}{{ end }}{{ if and (.Working.Changed) (.Staging.Changed) }} |{{ end }}{{ if .Staging.Changed }} \uf046 {{ .Staging.String }}{{ end }}{{ if gt .StashCount 0 }} \ueb4b {{ .StashCount }}{{ end }} ",
					"type": "git"
				}
			]
		},
		{
			"alignment": "right",
			"type": "prompt",
			"segments": [
				{
					"foreground": "p:sky",
					"style": "diamond",
					"template": "{{ round .PhysicalPercentUsed .Precision }}% [ {{ (div ((sub .PhysicalTotalMemory .PhysicalAvailableMemory)|float64) 1073741824.0) }}/{{ (div .PhysicalTotalMemory 1073741824.0) }}GB ]",
					"type": "sysinfo"
				}
			]
		},
		{
			"alignment": "left",
			"type": "prompt",
			"segments": [
				{
					"foreground": "p:violet",
					"leading_diamond": "<#DCD7FC>{</>",
					"properties": {
						"folder_icon": "\uf07b",
						"folder_separator_icon": " \uebcb ",
						"home_icon": "home",
						"style": "agnoster_full"
					},
					"style": "diamond",
					"template": " \ue5ff {{ .Path }} ",
					"trailing_diamond": "<#DCD7FC>}</> \uf178",
					"type": "path"
				}
			]
		}
	]
}
```
