import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },

	modules: ["@nuxt/content"],
	css: ["~/assets/css/main.css"],

	vite: {
		plugins: [tailwindcss()],
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
