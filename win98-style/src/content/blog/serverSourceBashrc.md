---
title: 解决每次连接服务器都要加载配置文件
pubDate: 2024-10-05T23:00:14+08:00
---

今天更新后端服务, 打算进服务器重启一下后端服务, 结果发现所有的应用都消失了, 只剩下一个远古时期的`node.js`.

![1](https://image.meorion.moe/image/serverSourceBashrc/1.webp)

服务器甚至没有重启过, 所有的东西就消失了.

我用来跑后端服务的`pm2`也没了, 但是服务一直好好地在运行, 我寻思不能是什么黑客啥的吧, 防火墙也开了, ssh端口也改了.

太奇怪了, 有点难蚌.

我本来都打算重新部署一遍服务了, 然后在备份数据的时候发现用户目录下是有软件的.

![2](https://image.meorion.moe/image/serverSourceBashrc/2.webp)

这个时候我就想起了, 貌似之前在部署服务的时候要执行`source ~/.bashrc`才能用命令来着的, 试了一下, 果然是要加载配置的问题.

既然知道原因就好解决了, 就是解决每次连接服务器都要加载配置文件的问题.

直接新建一个`.bash_profile`在里面写入一点代码让他自动加载`~/.bashrc`文件就好了.

因为有些linux系统会默认加载`.bash_profile`文件, 而不是`~/.bashrc`, 不过为什么我当初没有把配置写到`.bash_profile`而不是`~/.bashrc`我就不记得了(

打开`~/.bash_profile`文件.

```bash
vim ~/.bash_profile
```

在文件中输入下面的内容确保每次开机都会加载`~/.bashrc`.

```bash
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
fi
```

`:wq`保存退出后重新开了一个终端就能直接用命令了, 所有的东西也都正常了.
