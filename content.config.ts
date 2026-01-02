import { defineCollection, defineContentConfig } from "@nuxt/content";
import { z } from "zod";

export default defineContentConfig({
	collections: {
		page: defineCollection({
			type: "page",
			source: "**/**.md",
			schema: z.object({
				title: z.string(),
				priority: z.number(),
				published: z.boolean(),
			}),
		}),
		blog: defineCollection({
			type: "page",
			source: "blog/**.md",
			schema: z.object({
				pid: z.number(),
				title: z.string(),
				sort: z.string(),
				date: z.date(),
			}),
		}),
	},
});
