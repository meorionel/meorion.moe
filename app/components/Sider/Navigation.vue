<template>
	<Box title="Navigation">
		<ul class="opacity-75">
			<li class="flex w-full cursor-pointer items-center justify-between" v-for="item in navigation" :key="item.path">
				<NuxtLink :to="item.path" class="hover:underline hover:text-suso-moon" :target="item.isExternal ? '_blank' : undefined">{{ item.label }}</NuxtLink>
			</li>
		</ul>
	</Box>
</template>

<script lang="ts" setup>
const navigation = ref<{ path: string; label: string; isExternal?: boolean }[]>([
	{
		path: "/",
		label: "About",
		isExternal: false,
	},
	{
		path: "/blog",
		label: "Blog",
		isExternal: false,
	},
	{
		path: "/projects",
		label: "Projects",
		isExternal: false,
	},
	{
		path: "/friend",
		label: "Friend",
		isExternal: false,
	},
	{
		path: "/rss.xml",
		label: "RSS Feed",
		isExternal: true,
	},
	{
		path: "https://github.com/meorionel/meorion.moe",
		label: "Source Code",
		isExternal: true,
	}
]);
</script>
