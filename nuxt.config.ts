import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },

	modules: ["@nuxt/content"],
	css: ["~/assets/css/main.css"],

	vite: {
		plugins: [tailwindcss()],
	},
	app: {
		head: {
			title: "meorion.moe",
			htmlAttrs: {
				lang: "en",
			},
			link: [{ rel: "icon", type: "image/x-icon", href: "/icon.png" }],
		},
	},

	content: {
		build: {
			markdown: {
				highlight: {
					theme: "github-dark",
				},
			},
		},
	},
});
