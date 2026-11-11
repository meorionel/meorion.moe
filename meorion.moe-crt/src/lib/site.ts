/**
 * 站点级配置。
 * 全部来自环境变量：改链接 / 歌单 / Cookie 都不用动组件和接口代码。
 * NEXT_PUBLIC_* 会在构建时内联进浏览器包，没配置的链接直接不渲染。
 */

export type SiteLink = {
    label: string;
    href: string;
};

/** 卡片右下角的外链；在 .env.local 里配置 NEXT_PUBLIC_GITHUB_URL / NEXT_PUBLIC_X_URL */
export const SOCIAL_LINKS: SiteLink[] = [
    {label: "GitHub", href: process.env.NEXT_PUBLIC_GITHUB_URL ?? ""},
    {label: "X", href: process.env.NEXT_PUBLIC_X_URL ?? ""},
].filter((link) => link.href.trim() !== "");
