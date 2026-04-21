---
title: 小米路由器刷入openWRT
pubDate: 2024-07-20T10:26:40+08:00
---

## 写在前面

本文仅记录小米路由器 4A 千兆版(R4A)的刷机过程，用于参考作用。

教程来自[从 0 开始刷小米路由器 4a 千兆版 | 猪猪博客](https://blog.learnonly.xyz/p/630b.html)

## 准备工作

- 一根网线和能插网线的电脑

- R4A 刷机工具+openWRT
    - 本教程用到的所有工具和固件 https://www.123pan.com/s/iTK6Vv-P1hwh.html提取码:0415

    - 固件来自[GitHub - MrTaiKe/Action_OpenWrt_Xiaomi_R4AGv2: Xiaomi R4AGv2 Gigabit Router OpenWrt Breed Flash 小米路由器 R4Av2 千兆版](https://github.com/MrTaiKe/Action_OpenWrt_Xiaomi_R4AGv2)

- ssh & ftp 连接工具，本文使用的是 xshell 和 windows 自带的资源管理器

## 开始

### 一、ssh 连接

#### 使用 powershell 解锁 ssh

输入下面的命令

```shell
.\python.exe .\remote_command_execution_vulnerability_v2.py
```

如果显示了`telnet`、`ssh`、`ftp`的信息就说明服务启动成功了，如果不成功可以多尝试几次。

![1](https://image.meorion.moe/image/openWRT/1.png)

#### 使用 ssh 工具连接路由器

我这里使用的是 xshell，主机为`192.168.31.1`，用户名和密码都是`root`

![2](https://image.meorion.moe/image/openWRT/2.png)

### 二、备份原厂固件

登录进去后执行下面的命令，命令会将原厂固件保存到`/tmp`目录。

```shell
cat /proc/mtd&&dd if=/dev/mtd0 of=/tmp/all_backup.bin
```

这个时候我们需要使用 ftp 工具取出固件。

我本来想使用 winSCP，但是不知道什么原因连接上了但是显示不出文件，所以直接用资源管理器了。

将`all_backup.bin`文件复制出来，这个就是刚刚保存的原厂固件。

注意！这里要使用右键菜单中的`复制到文件夹`。

![3](https://image.meorion.moe/image/openWRT/3.webp)

检查文件的大小，正常情况下应该是 16M，如果非常小就说明前面的步骤可能出问题了，建议删除路由器中的`all_backup.bin`重新执行命令再将文件复制出来。

![4](https://image.meorion.moe/image/openWRT/4.webp)

### 三、刷入不死鸟 breed

使用资源管理器进入`/tmp`目录，将`breed.bin`复制到`/tmp`目录下。

![5](https://image.meorion.moe/image/openWRT/5.webp)

在 shell 中检查`breed.bin`的 MD5，对比 MD5 值`24e62762809c15ba3872e610a37451a3`如果 MD5 值不同，请重新上传。

![6](https://image.meorion.moe/image/openWRT/6.png)

确认原厂固件`all_backup.bin`备份完成以及`breed.bin`上传完成后，执行以下命令刷入 breed。

```shell
mtd write /tmp/breed.bin Bootloader
```

这一步可能会断网，我做的时候没有断，这都是正常的。

将连接电脑的网线从 LAN 口插到 WAN 口，绿圈的是 WAN 口，红圈是 LAN 口。

![7](https://image.meorion.moe/image/openWRT/7.webp)

在浏览器输入`192.168.1.1`进入 breed 后台。如果无法进入，将路由器断电，按住复位键，路由器通电，等待 5~10s 松开复位键，再在路由器输入`192.168.1.1`，进入速度可能会有些慢，多等一会。如果长时间无法进入，可能是前面的步骤出错，检查一些自己的操作。

### 四、刷入 openWRT

在刷入 openWRT 固件前在固件备份中备份`编程器固件`以及`EEPROM`。

![8](https://image.meorion.moe/image/openWRT/8.webp)

打开固件更新选择你的`openwrt.bin`固件，或者开头我提供的`R4AG v2`固件，又或者是你自己的固件。在`EEPROM`选择刚刚备份下来的`eeprom.bin`，点击刷入会跳转到一个确认页面，在这里点击上传，读条完成后路由器会自动重启。将网线从 WAN 口插回 LAN 口，在路由器输入`193.168.31.1`就能进入`openWRT`了（这里进入时间可能会比较慢，建议多等一两分钟）。默认的用户名密码是`root/password`，如果不对自行询问固件作者。

(选择固件的截图忘记截了)

![9](https://image.meorion.moe/image/openWRT/9.webp)

![10](https://image.meorion.moe/image/openWRT/10.jpg)
