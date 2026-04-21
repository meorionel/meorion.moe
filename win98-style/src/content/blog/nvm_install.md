---
title: nvm 安装使用
pubDate: 2024-11-21T15:42:14+08:00
---

## 在线安装

安装nvm需要有`git` `curl`或者`wget`

```bash
# 下载脚本并运行

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
```

## 本地安装

如果因为网络问题无法下载脚本的话可以另辟蹊径

从官网把包下载到自己的电脑上再上传至服务器，直接手动安装。

```bash
# 下载到自己的电脑上
https://github.com/nvm-sh/nvm/archive/refs/tags/v0.39.1.tar.gz

# 将压缩包上传到服务器上，例如我现在上传到我的用户根目录

# 新建一个文件夹用于存放nvm
mkdir /root/.nvm

# 解压
tar -zxvf nvm-0.39.1.tar.gz --strip-components 1  -C /root/.nvm

# 配置环境变量
# bash
vim ~/.bashrc
# zsh
vim ~/.zshrc

# 写入配置
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

# 刷新配置
# bash
source ~/.bashrc
# zsh
source ~/.zshrc

# 查看是否成功安装 输出版本号则成功安装
nvm -v
```

## 使用

```bash
# nvm install 版本号
nvm install v20.11.1

# 安装完成后查看版本号是否对应
node -v

# 如果没有输出版本号就执行一下use命令
# nvm use 版本号
nvm use v20.11.1

# 查看机器上的nodejs版本
nvm ls
```

## 可能碰到的奇怪问题

安装的时候可能会碰到安装不了指定的版本，这个时候可以执行命令查看目前可安装的`node.js`版本。

```bash
nvm ls-remote
```

大概率会输出一大堆陌生的版本，就是没有你需要的版本。

但是解决方法我忘了，等我碰到再写。

写这篇文其实主要是想记录一下这个的解决办法，但是这次没碰到(乐
