---
title: Windows 终端美化
pubDate: 2024-11-22T20:25:10+08:00
---

最近发现 Windows 11 更新了 LTSC 版本，也是迫不及待地换上了。

换系统不可避免要重新配置环境，装各种各样的软件，就顺便安利一下终端美化。

## 安装 Windows Terminal

这是巨硬推出的终端工具，可以理解为是 Windows 系统自带终端的 Plus 版本。

从GitHub直接下载压缩包，便携版解压即用。

<https://github.com/microsoft/terminal/releases/tag/v1.21.3231.0>

从巨硬应用商店下载。

<https://www.microsoft.com/store/productId/9N0DX20HK701?ocid=pdpshare>

## 更新 PowerShell

windows 自带的 PowerShell版本比较老，我们需要更新到 7 ，否则会有一些问题。

通过 MSI 安装。

<https://learn.microsoft.com/zh-cn/powershell/scripting/install/installing-powershell-on-windows?view=powershell-7.4#msi>

从巨硬应用商店下载。

<https://www.microsoft.com/store/productId/9MZ1SNWT0N5D?ocid=pdpshare>

安装完成后打开 Windows Terminal 就能看到我们安装的 PowerShell了。

![PowerShell7](https://image.meorion.moe/image/WindowsTerminal_oh-my-posh/PowerShell7.webp)

这个时候打开 Windows Terminal 还是会默认打开旧的 PowerShell，在设置调一下就好了。

![默认启动](https://image.meorion.moe/image/WindowsTerminal_oh-my-posh/defaultStart.webp)

## 安装 Oh My Posh

这是一个 Windows Terminal 增强工具，不过我单纯把它当作一个美化工具。

通过命令行安装。

```bash
# winget
winget install JanDeDobbeleer.OhMyPosh -s winget

# scoop
scoop install https://github.com/JanDeDobbeleer/oh-my-posh/releases/latest/download/oh-my-posh.json

# manual
Set-ExecutionPolicy Bypass -Scope Process -Force; Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://ohmyposh.dev/install.ps1'))
```

从巨硬应用商店下载。

<https://apps.microsoft.com/store/detail/XP8K0HKJFRXGCK?ocid=pdpshare>

安装完成之后重启终端执行`oh-my-posh`指令，如果没有输出指令的使用方法，或者显示没有被正确识别，就需要手动添加环境变量：

```powershell
# 添加到 PATH
$env:Path += ";C:\Users\user\AppData\Local\Programs\oh-my-posh\bin"
```

### 安装字体

因为 oh my posh 需要用到一些图标，而这些图标是普通字体没有的，所以需要额外安装字体以供正常的美化。

oh my posh 用的是 Nerd Fonts ，你可以通过这个网站下载你喜欢的字体，然后安装他们就好了。

<https://www.nerdfonts.com/font-downloads>

当然，你也可以通过`oh-my-posh`命令安装：

```powershell
oh-my-posh font install ComicShannsMono
```

安装完成后在 Windows Terminal 的设置页面将字体修改为你安装的字体后保存即可。

![使用字体](https://image.meorion.moe/image/WindowsTerminal_oh-my-posh/useFont.webp)

### 配置主题

执行一下初始化命令就能看见 oh my posh 的默认主题了。

```powershell
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\jandedobbeleer.omp.json" | Invoke-Expression
```

![初始化](https://image.meorion.moe/image/WindowsTerminal_oh-my-posh/initialize.webp)

执行`Get-PoshThemes`可以获取到 oh my posh 官方收录的主题，除了官方收录的你也可以去网上下载别人制作的主题。

如果你觉得终端输出太复杂，你也可以去官网看看：

<https://ohmyposh.dev/docs/themes>

挑选完你心意的主题就该安装主题了：

```powershell
# 使用记事本修改配置文件
notepad $PROFILE

# 如果你是第一次配置 99%会显示系统找不到指定路径，这是因为配置文件还没有生成
# 执行这个命令生成一个配置文件即可
New-Item -Path $PROFILE -Type File -Force

# 我现在需要安装使用 1_shell 在配置文件中输入
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH/1_SHELL.omp.json" | Invoke-Expression

# 保存退出后在终端执行命令来刷新应用主题
. $PROFILE

# 执行上面的指令多半会报错显示"无法加载文件 ... 因为在此系统上禁止运行脚本"
# 只需要以管理员身份打开一个新的终端然后执行命令允许系统从本地加载配置文件即可
Set-ExecutionPolicy RemoteSigned
```

其实这个配置文件里面放的就是初始化命令，启动 PowerShell 时会自动执行初始化命令，相当于省去我们每次打开终端都要手动初始化。

安装应用主题不过也只是添加了一个启动条件。

### 其他的问题（看看就好了）

在我执行`. $PROFILE`的时候出现了一些问题，终端报错了，主题也没有应用，我也是第一次碰到这个问题。

```powershell
> . $PROFILE
Get-PSReadLineKeyHandler : 找不到接受实际参数“Spacebar”的位置形式参数。
所在位置 行:520 字符: 18
+             if ((Get-PSReadLineKeyHandler Spacebar).Function -eq 'OhM ...
+                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidArgument: (:) [Get-PSReadLineKeyHandler]，ParameterBindingException
    + FullyQualifiedErrorId : PositionalParameterNotFound,Microsoft.PowerShell.GetKeyHandlerCommand

Get-PSReadLineKeyHandler : 找不到接受实际参数“Enter”的位置形式参数。
所在位置 行:524 字符: 18
+             if ((Get-PSReadLineKeyHandler Enter).Function -eq 'OhMyPo ...
+                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidArgument: (:) [Get-PSReadLineKeyHandler]，ParameterBindingException
    + FullyQualifiedErrorId : PositionalParameterNotFound,Microsoft.PowerShell.GetKeyHandlerCommand

Get-PSReadLineKeyHandler : 找不到接受实际参数“Ctrl+c”的位置形式参数。
所在位置 行:528 字符: 18
+             if ((Get-PSReadLineKeyHandler Ctrl+c).Function -eq 'OhMyP ...
+                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidArgument: (:) [Get-PSReadLineKeyHandler]，ParameterBindingException
    + FullyQualifiedErrorId : PositionalParameterNotFound,Microsoft.PowerShell.GetKeyHandlerCommand
```

问了一下 GPT 大概原因就是这些快捷键找不到需要执行的命令(?)。

执行`Get-PSReadLineKeyHandler | Format-Table -AutoSize`就可以看到最下面的用户自定义快捷键，这些快捷键都是多余的，并不是我们自己设定的，直接执行命令清除。

```powershell
# 清除单个
Remove-PSReadLineKeyHandler -Key Spacebar

# 重置所有键的绑定
Set-PSReadLineOption -EditMode Windows
```

清除之后重新执行`. $PROFILE`，虽然还是会报错，但是主题应用上了，而且新建终端也没报错能够正常加载配置文件，就当无事发生了。

![完成主题安装](https://image.meorion.moe/image/WindowsTerminal_oh-my-posh/accomplish.webp)

在和GPT的对话中，GPT告诉使用 PowerShell 7 和 oh my posh 兼容性最好，而且在新建的终端看见它叫我更新 PowerShell，我就尝试更新了一下 PowerShell。

结果更新完再去执行`. $PROFILE`就没有报错了，给我整得有点无语...
