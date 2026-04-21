interface config {
	author: {
		name: string;
		avatar: string;
		gender: string;
		yob: number;
		bio: string;
		email: string;
		location: string;
		social: {
			name: string;
			url?: string;
			username?: string;
		}[];
	};
	site: {
		title: string;
		description: string;
		url: string;
		favicon: string;
	};
	project: {
		name: string;
		description: string;
		url: string;
	}[];
}

export const CONFIG: config = {
	author: {
		name: "Meorion",
		avatar: "https://gravatar.meorion.moe/avatar/me",
		gender: "He/Him",
		yob: 2004,
		bio: "The feeling of liking is a kind of floating magic 🔮",
		email: "me@meorion.moe",
		location: "China/GuiLin",
		social: [
			{
				name: "Twitter/X",
				url: "https://x.com/meorionel",
			},
			{
				name: "Github",
				url: "https://github.com/meorionel",
			},
			{
				name: "Discord",
				username: "meorionel"
			},
			{
				name: "Email",
				username: "me@meorion.moe"
			}
		],
	},
	site: {
		title: "Meorion.moe",
		description: "这是 Meorion 的网站",
		url: "https://meorion.moe",
		favicon: "/favicon.png",
	},
	project: [
		{
			name: "GetDiscordEmoticon",
			description: "这个工具可以帮助你批量下载 Discord 上的表情.",
			url: "https://github.com/meorionel/GetDiscordEmoticon",
		},
		{
			name: "Netease_analyze",
			description: "这是一个网易云的无损解析工具",
			url: "https://github.com/meorionel/Netease_analyze",
		},
		{
			name: "Minecraft3DHead",
			description: "这是一个可以获取我的世界玩家 3d 或者 2d 头颅图片的 api.",
			url: "https://github.com/meorionel/Minecraft3DHead",
		},
		{
			name: "nuxt-oneko",
			description: "添加一个可爱的小猫到你的nuxt网站中.",
			url: "https://github.com/meorionel/nuxt-oneko",
		},
		{
			name: "Am I Okay",
			description: "在这个网站, 你可以看到我正在做什么.",
			url: "https://ami.meorion.moe/",
		},
	]
};
