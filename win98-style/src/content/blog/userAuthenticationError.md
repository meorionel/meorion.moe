---
title: mysql用户认证问题
pubDate: 2024-09-24T12:22:53+08:00
---

# 出错原因

```
Client does not support authentication protocol requested by server; consider upgrading MySQL client
```

这个问题是我在使用node.js + MySQL8.0时经常遇到的问题, 原因是因为MySQL8.0引入了新的认证协议--`caching_sha2_password`, 但是nodejs的mysql模块并不支持新的认证方式, 所以才会出现这个报错.

# 解决方法

解决方法很简单, 直接修改服务端的用户认证方式为nodejs支持的`mysql_native_password`就可以了

```mysql
<!-- 修改权限 -->
ALTER USER 'username'@'hostname' IDENTIFIED WITH mysql_native_password BY 'password';

<!-- 刷新权限表 -->
FLUSH PRIVILEGES;

<!-- 查看用户认证方式 -->
SELECT host, user, plugin FROM mysql.user;
```
