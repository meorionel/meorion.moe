---
title: 免费的 zoho 域名邮箱
pubDate: 2026-02-10T14:29:57+08:00
---

买了好几年域名了, 但是一直以来都是用的 gmail yandex 之类的邮箱.

之前虽然有想过整个自己的域名邮箱, 用 **dynadot** 的域名邮箱发邮件又很容易进垃圾箱, 找了很久第三方没有合适的, 要不然就是太贵了.

前两天去更新友链的时候发现 [ZLA](https://zla.pub/) 的评论区提醒邮箱用的是域名邮箱, 去问了一下, 知道 zoho 一个月只需要一刀乐, 索性就打算整一个, 不过我钱都准备好了, 去研究了一下, 发现原来是有免费计划的(好耶).

当然, 免费版是有很多限制的, 例如只能有一个用户, 也就是只能有一个域名.

## 准备工作

既然是域名邮箱, 那当然是要有一个域名, 直接在各大域名商随便买就好了.

最好把你的域名放到 **CloudFlare** 上, 这样后面的步骤可以节省时间.

## 1. 注册一个 zoho 账号

进入 [zoho.com/mail](https://www.zoho.com/mail/), 选择 **Business Email(商务电子邮件)**, 右边那个是个人邮箱, 是注册不了域名邮箱的, 只能注册 zoho 自己的邮箱, 也就是 xxx@zoho.com.

直接用邮箱注册就好了, 可以不使用手机号码.

> 注意 这里是国际版的 **zoho**, 不是 **zoho 中国**!

![注册账号](https://image.meorion.moe/image/zoho_free_domain_mail/1.webp)

注册登录之后会让你选择计划, 这里没有免费计划显示, 随便选择一个就好了, 我直接选 **Mail Lite**.

![选择计划](https://image.meorion.moe/image/zoho_free_domain_mail/selectPlan.webp)

## 2. 绑定域名

这一步绑定你的域名, 直接选择 **Add an existing domain**, 添加我们自己有的域名.

![绑定域名](https://image.meorion.moe/image/zoho_free_domain_mail/bindDomain.webp)

绑定完下一步需要写一些你自己的品牌信息, 这里可以随便写, 域名不要写错就可以了.

![绑定域名](https://image.meorion.moe/image/zoho_free_domain_mail/addInfo.webp)

注意! 这一步具体配置你的计划, 下一步会进入付款, 我们不能在这里下一步.

![选择计划](https://image.meorion.moe/image/zoho_free_domain_mail/selectPlan1.webp)

直接开一个新标签页, 然后重新进入 [zoho.com/mail](https://www.zoho.com/mail/).

然后你就会看见 **Welcome to Zoho Mail!**

![Welcome to Zoho Mail!](https://image.meorion.moe/image/zoho_free_domain_mail/welcomeToZohoMail.webp)

在这里选择 **Create domain based email account in Zoho.** 即可.

点击 **Verify [your domain]**, 验证域名的归属权, 因为我的域名是存放在 **CloudFlare** 的, 直接选择自动导入, 可以自动确认域名的归属权.

验证完成后会创建一个 **Super Admin** 邮箱, 我这里直接写 me 了, 毕竟是我自己的域名邮箱.

![superAdmin](https://image.meorion.moe/image/zoho_free_domain_mail/superAdmin.webp)

之后会问你要不要创建其他的邮箱和组, 因为我们是自己用的邮箱, 所以暂时先跳过.

> 组(Groups) 是一群人共用的邮箱, 你可以理解为一个部门的人都用这个邮箱来收发邮件.

## 3. 填写 DNS

这一步超级简单的, 上面也说了, 因为我的域名存放在 **CloudFlare** 的, 直接让他自动导入就好了, 手动的话就按照他给的提示去填写就好了.

![dns](https://image.meorion.moe/image/zoho_free_domain_mail/dns.webp)

## 4. 完成域名邮箱注册

之后的步骤就按需选择了, 比如下载手机app, 迁移数据.

## 5. 测试邮箱功能

登录到邮箱的[面板](https://mail.zoho.com/zm/#mail/folder/inbox).

给自己的其他邮箱发个邮件, 其他邮箱给自己发个邮件, 确认都能正常收发即可, 如果不能正常收发多半是 DNS 的问题.

![test](https://image.meorion.moe/image/zoho_free_domain_mail/testMail.webp)

可以看到, 我们收发的邮件都没有进入垃圾箱, 成功!

## 设置别名邮箱

虽然免费版本只能拥有一个邮箱, 但是我们可以设置多个别名, 你可以理解为一个服务器, 一个 ip, 但是可以设置多个域名指向同一个 ip.

登录邮箱[仪表盘](https://mailadmin.zoho.com/)按照图片指示操作即可.

![设置别名邮箱](https://image.meorion.moe/image/zoho_free_domain_mail/alias1.webp)

## 添加 DMARC 验证

这一步可以提高你的邮箱域名的信用, 避免进入别人的垃圾箱.

按照图片指示进入配置页面, 填写 **聚合通知邮件地址** & **取证通知邮件地址**, 这两个地址建议填到一个不常用的邮箱去.

![添加 DMARC 验证](https://image.meorion.moe/image/zoho_free_domain_mail/DMARC.webp)

点击生成之后按照提示添加一个txt记录即可.

## 结束

现在你已经有了一个属于自己的域名邮箱, 虽然和 **dynadot** 自带的邮箱差不多, 但是我测试了好几个邮箱, 都不会随便进垃圾箱了.

如果有需要, 一年只需要十二刀乐也可以获得多个域名邮箱, 或者是 IMAP/POP 访问.

> 说真的, 如果不是没有稳定收入, 这十二刀乐我直接掏了, zoho 自己的邮箱 app 做的好丑... 我现在手机里面有五个邮箱 app 免费计划又用不了 IMAP.
