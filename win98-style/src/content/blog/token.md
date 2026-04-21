---
title: 无感刷新token实践
pubDate: 2025-06-06T16:16:11+08:00
---

对于用户身份权限验证方法有多种, 使用 Token 是一种常见的方式.

但是一般为了安全性, token的有效期不会太长, token过期就会导致用户认证失败, 用户需要重新登录获取新的token.

一般根据业务场景会设置不同的有效期, 假如因为业务需要把token有效期设置得太短, 导致用户需要反复登录, 那是不行的.

所以就需要使用无感刷新token.

---

这里将使用[jwt](https://www.npmjs.com/package/jsonwebtoken)来创建token.

有关jwt的知识可以看看[阮一峰的网络日志 - JSON Web Token 入门教程](https://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)

环境将使用`node.js`.

## 无感刷新的原理

一般我们只有一个token用于请求资源.

如果要实现无感刷新, 我们就需要使用两个token: `access token` & `refresh token`, 前者用于请求资源, 后者用于请求新的`access token`.

一般`access token`的有效期很短, 而`refresh token`的有效期很长.

在`access token`快过期或者已过期时发起新token的申请.

## 简单实现

现在在处理登录时返回两个token.

我们在`access token`添加用户标识, 用于在申请资源时识别用户身份.

设置一个密钥用于保证在申请资源时确保token没有被修改或者不是我们自己的token.

设置一个短的有效期, 这里设置了 10 分钟.

```javascript
const assetsToken = jwt.sign({ username, uuid }, "key", { expiresIn: "10m" });
```

现在我们再创建一个`refresh token`.

我们在`refresh token`添加用户标识, 用于辨别用户.

设置一个长的有效期, 这里设置了 10 天.

```javascript
const refeshToken = jwt.sign({ username }, "key", { expiresIn: "10d" });
```

好了, 现在我们有两个token了, 当`access token`过期时就使用`refresh token`去申请一个新的`access token`.

---

但是如果稍微想想, 就会发现这不太对, 似乎有点脱裤子放屁, 因为这两个token除了少了一个uuid和有效期不一样几乎没有区别.

假如`refresh token`被盗了, 别人就可以使用`refresh token`毫无压力地申请新的`access token`, 倒不如直接把`access token`的有效期设置为 10 天.

所以我们现在需要引入一个浏览器指纹, 用于辨别当前申请新`access token`的是否为用户本人, 而不是盗窃者.

这里我获取了几个请求头的内容, 用于作为指纹的部分, 再使用`sha256`进行加密.

加密的作用一是保证用户的环境不会被泄露, 二是可以缩短信息, 从一个对象变成一个字符串, 避免生成的token太长.

```javascript
const fingerprintData = {
	userAgent: event.node.req.headers["user-agent"],
	acceptLanguage: event.node.req.headers["accept-language"],
	acceptEncoding: event.node.req.headers["accept-encoding"],
	secCHUA: event.node.req.headers["sec-ch-ua"],
	platform: event.node.req.headers["sec-ch-ua-platform"],
	ip: event.node.req.headers["x-forwarded-for"],
};
const fingerprint = b64_hmac_sha256(salt, JSON.stringify(fingerprintData));
```

---

好了, 我们解决了一个安全问题, 接下来还有一个问题.

如果你在申请新的`access token`时同时更新了`refresh token`, 就会发现, 即使更新了`refresh token`, 旧的`access token`依旧可用, 虽然貌似不会造成什么问题, 但为了安全考虑还是应该将旧的废除.

但因为jwt是无状态的, 所以我们不能直接从jwt下手去废除.

我们可以简单粗暴一点, 创建一个数据库表, 用来保存所有废除的token, 在申请的时候直接查询表, 如果token存在就说明是旧的token, 这很简单, 但是假如使用久了, 数据库中的旧token就会很多, 如果再去查询就会导致查询时间过长, 会造成性能问题.

当然, 也可以直接把新的`refresh token`直接写到user表去, 这样就能避免性能问题, 只要在申请的时候查询token是否正确即可, 但是假如token毕竟长, 会浪费很多空间, 又造成了空间浪费.

所以我们需要引入一个token version, 用于解决废弃旧token的问题.

我们可以使用简单的数字来进行版本管理, 但是考虑到简单的数字排序会被猜出来, 所以我使用了随机字符串作为版本号进行管理.

生成指定长度的随机字符串.

```javascript
const randomString = (length) => {
	const t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz12345678";
	let a = t.length,
		n = "";
	for (let i = 0; i < length; i++) n += t.charAt(Math.floor(Math.random() * a));
	return n;
};
```

我们将token version直接添加到user表即可.

现在我们将版本添加进`refresh token`.

```javascript
const refeshToken = jwt.sign({ fingerprint, username, version }, "key", { expiresIn: "10d" });
```

这样, 当我们在申请新的`access token`时可以通过`fingerprint`判断用户是否为本人, 通过`version`判断当前token是否为最新的token.
