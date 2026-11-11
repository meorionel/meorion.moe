/**
 * 友链清单。
 * 顺序与 meorion.moe（Win98 版）首页的友链保持一致，
 * 只是把 88×31 按钮换成了适合 CRT 界面的域名标注。
 *
 * host 单独写出来而不用 new URL(url).hostname：
 * 列表要同时在服务端和浏览器渲染，写死可以避免解析差异，也方便手动缩短长域名。
 */

export type Friend = {
    /** 展示用的名字，保持友链主人的写法 */
    name: string;
    /** 头像地址；远程图片加载失败时用名字首字母兜底 */
    avatar: string;
    url: string;
    /** 列表里显示的域名 */
    host: string;
};

export const FRIENDS: Friend[] = [
    {
        name: "meorion",
        avatar: "https://gravatar.meorion.moe/avatar/me",
        url: "https://meorion.moe/",
        host: "meorion.moe",
    },
    {
        name: "lassksy",
        // 原图在 Win98 版的 public/friend/lassksy.webp，这里直接放本地副本
        avatar: "/media/friends/lassksy.webp",
        url: "https://nobelium-gnprqf8qw-woodudes-projects.vercel.app/",
        host: "lassksy.vercel.app",
    },
    {
        name: "Ariasaka",
        avatar: "https://img.0v0.my/2025/01/24/679335e1bf5b4.jpg",
        url: "https://blog.yaria.top",
        host: "blog.yaria.top",
    },
    {
        name: "Imken",
        avatar: "https://github.com/immccn123.png",
        url: "https://imken.moe/",
        host: "imken.moe",
    },
    {
        name: "ZLA",
        avatar: "https://gravatar.zla.app/avatar/me",
        url: "https://www.zla.pub/",
        host: "zla.pub",
    },
    {
        name: "lynn",
        avatar: "https://blog-dogecdn.lynn6.cn/pic/fb2c42d74892b1e208c0be7af2be20b31627004540489.jpeg",
        url: "https://blog.lynn6.top",
        host: "blog.lynn6.top",
    },
    {
        name: "Smirnova Oyama",
        avatar: "https://mahiro.uk/content/nekoxun.jpg",
        url: "https://mahiro.uk/",
        host: "mahiro.uk",
    },
    {
        name: "cos",
        avatar: "https://blog.cosine.ren/img/avatar.webp",
        url: "https://blog.cosine.ren/",
        host: "blog.cosine.ren",
    },
    {
        name: "Almango",
        avatar: "https://www.almango.cn/image/avatar.png",
        url: "https://blog.almango.cn/",
        host: "blog.almango.cn",
    },
    {
        name: "NNNullptr南",
        avatar: "https://www.xnmoe.com/assets/images/pfp.png",
        url: "https://xnmoe.com",
        host: "xnmoe.com",
    },
    {
        name: "NPCの个人博客",
        avatar: "https://777703.xyz/wp-content/uploads/2026/03/avatar.jpg",
        url: "https://777703.xyz/",
        host: "777703.xyz",
    },
];
