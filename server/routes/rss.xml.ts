import RSS from "rss";

export default defineEventHandler(async (event) => {
	try {
		const posts = await queryCollection(event, "blog").all();

		const feed = new RSS({
			title: `Meorion's Blog`,
			site_url: "https://meorion.moe",
			feed_url: "https://meorion.moe/rss.xml",
		});

		for (const post of posts) {
			feed.item({
				title: post.title,
				url: `https://meorion.moe${post.path}`,
				description: post.description,
				date: post.data,
			});
		}
		const feedString = feed.xml({ indent: true });
		event.node.res.setHeader("content-type", "text/xml");
		event.node.res.end(feedString);
	} catch (e) {
		return e;
	}
});
