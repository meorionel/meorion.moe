---
pid: 2
title: Teach you to write a simple terminal theme
date: 2025-10-21T08:16:11.000Z
sort: tool
---

Two days ago, I discover that **oh my posh** supported `windowss` `Mac` `Linux`, and I thought that the themes of **oh my posh** were much better than those of **oh my zsh** and **oh my bash**.

I spent a few hours to replace **oh my zsh** on my Mac with **oh my posh**, and I found that none of the themes I liked were available. I opened the theme file and found that it was quite simple to write a theme.

So I spent half an afternoon writing a topic based on the document.

![posh theme](https://image.s22y.moe/image/ohmyposh/1.webp)

---

Installation won't go into detail. It's very simple. Just one command will do. Installation on Mac might get stuck at 'go build', so you can install it directly using a script.

```bash
curl -s https://ohmyposh.dev/install.sh | bash -s
```

---

**oh my posh** is based on blocks to display the terminal, so you only need to build it by simple blocks.

The theme file is default `json`, but also support `toml` `yaml`. I choose `json` because I think it's more structured and easier to read.

Below is a blank theme file. When you use this blank theme, your terminal will only display the cursor and the command you input.

```json
{
	"$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
	"version": 3,
	"blocks": []
}
```

Let me briefly explain the functions of each configuration mentioned above.

- "$schema": Point to an online JSON schema for verifying the syntactic correctness of configuration files, providing intelligent prompts and error checking (it's not something particularly important, just don't touch it).
- "version": Configuration version, don't touch it.
- "blocks": Blocks, where we write our theme.

Excluding the above configurations, there are some other configurations, such as:

- final_space: Whether to add a space before the command
- maps: Add custom text mappings, such as detecting the root user, will replace the variable responsible for displaying the user with your custom text.
- palette: Palette, you can add some preset colors.

For more details, please refer to the [documentation](https://ohmyposh.dev/docs/configuration/general#settings).

---

Now let's start writing a simple theme (the complete configuration file will be provided at the end of the article, you don't need to worry about where to add a certain fragment).

First, let's add a palette. This can help us standardize colors, and I'm using colors from tailwindcss here.

```json
"palette": {
	"rose": "#F7CFD3",
	"sky": "#C1E5FC",
	"violet": "#DCD7FC",
	"green": "#B6F1D2",
	"gray": "#E6E7EB"
},
```

Below is a block-level option that needs to be added to the `blocks` array. In this block, there are two critical options:

- alignment: Position, can only be `left` or `right`
- type: Must be `prompt` or `rprompt` (when filled with `rprompt`, the block will display on the right)
- segments: Segments, a block can contain multiple segments.
    - foreground: Palette, use `p:` + the color name you preset above to select a color from the palette.
    - style: Style, can be `powerline`, `plain`, `diamond`, `accordion`
    - template: Display content template
    - type: Type, can be multiple types, as there are too many of them, it's not possible to explain them all in a sentence. For more details, please refer to the [documentation](https://ohmyposh.dev/docs/segments/system/text)

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

In the template, double curly braces `{{ }}` contain variables (perhaps you can understand it like Vue).

Below is a common variable, depending on the `type` of the segment, there are more options for variables.

| name            | type      | description                                                |
| --------------- | --------- | --------------------------------------------------- |
| `.Root`         | `boolean` | Whether the current user is root/admin              |
| `.PWD`          | `string`  | Current working directory ($HOME directory displayed as ~) |
| `.AbsolutePWD`  | `string`  | Current working directory (unmodified raw path)     |
| `.PSWD`         | `string`  | PowerShell current working directory (non-file system path) |
| `.Folder`       | `string`  | Current working folder                                      |
| `.Shell`        | `string`  | Current shell name                                     |
| `.ShellVersion` | `string`  | Current shell version                                     |
| `.SHLVL`        | `int`     | Current shell level                                     |
| `.UserName`     | `string`  | Current user name                                        |
| `.HostName`     | `string`  | Host name                                              |
| `.Code`         | `int`     | Last exit code                                        |
| `.Jobs`         | `int`     | Number of background jobs (only available in zsh, PowerShell, and Nushell) |
| `.OS`           | `string`  | Operating system name                                |
| `.WSL`          | `boolean` | Whether running in WSL                               |
| `.Templates`    | `string`  | Template result                                      |
| `.PromptCount`  | `int`     | Prompt counter, incremented by 1 each time the prompt is called |
| `.Version`      | `string`  | Oh My Posh version                                   |
| `.Segment`      | `Segment` | Current segment metadata                                    |

In the template, `\uf178` is a Unicode escape sequence that will be rendered as an icon. You can search for the icon you want on [this website](https://www.nerdfonts.com/cheat-sheet), and click **UTF** to copy the corresponding code.

> Note that you need to install and set the terminal font to a **Nerd Fonts** series font to display the icon correctly. This is also something you need to do when installing **oh my posh**.

Now let's assume you want to add a line break to move the command input to the second line. You can simply add a `\n` in the template, and the command input will be displayed on the second line.

```json
{
	"foreground": "p:rose",
	"style": "plain",
	"template": "{{ .UserName }}@{{ .HostName }} \n",
	"type": "text"
}
```

---

Now let's add a block to display memory usage on the right.

This memory display is from another theme file, so I don't know what these variables mean (

If you see something you want in other theme files, just go and check their source code, and copy it over. As long as the code is in your file, it's your code!

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

Next, let's add a status on github.

Of course, this is also from my cv. I have no idea what these are either. As long as they can be displayed normally, that's fine!

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

Finally, we add another path to display on the second line.

This is ` type ` bring more different Settings, such as this is ` path `, then you can according to ` path ` type to add more [configuration](https://ohmyposh.dev/docs/segments/system/path)

```json
{
	"alignment": "left",
	"type": "prompt",
	"segments": [
		{
			"foreground": "p:violet",
			"leading_diamond": "<#DCD7FC>{</>",
			"properties": {
				"folder_icon": "\uf07b", // folder icon (Font Awesome)
				"folder_separator_icon": " \uebcb ", // folder separator icon (Nerd Fonts)
				"home_icon": "home", // home directory display as "home"
				"style": "agnoster_full" // agnoster full path style
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

![](https://image.s22y.moe/image/ohmyposh/2.webp)

The complete code is as follows:

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