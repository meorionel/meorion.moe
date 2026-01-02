<template>
	<Box title="On This Page">
		<template v-if="toc && toc.body.toc?.links.length !== 0">
			<ul class="opacity-75">
				<li v-for="item in toc.body.toc?.links" :key="item.id" :class="{ 'text-suso-moon opacity-100': activeId === item.id }">
					<NuxtLink :to="`#${item.id}`"> {{ generateHashTags(item.depth) }} {{ item.text }} </NuxtLink>
				</li>
			</ul>
		</template>
		<template v-else>
			<ul class="opacity-75">
				<li>No Toc</li>
			</ul>
		</template>
	</Box>
</template>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();
const dataKey = computed(() => route.path);

const { data: toc, refresh } = await useAsyncData(`toc-${dataKey.value}`, async () => {
	if (route.path.startsWith("/blog")) {
		return queryCollection("blog").path(route.path).first();
	} else {
		return queryCollection("page").path(route.path).first();
	}
});

const generateHashTags = (n: number): string => {
	if (typeof n !== "number" || n < 0) {
		return "";
	}
	return "#".repeat(n);
};

const activeId = ref<string | null>(null);
let observer: IntersectionObserver | null = null;

const handleIntersect: IntersectionObserverCallback = (entries) => {
	const visibleEntries = entries.filter((entry) => entry.isIntersecting);

	if (visibleEntries.length > 0) {
		const first = visibleEntries[0];
		if (first && (first.target as HTMLElement).id) {
			activeId.value = (first.target as HTMLElement).id;
		} else {
			activeId.value = null;
		}
	}
};

const setupObserver = () => {
	// 清除之前的observer
	if (observer) {
		observer.disconnect();
	}

	observer = new IntersectionObserver(handleIntersect, {
		rootMargin: "0px 0px -60% 0px",
		threshold: 0,
	});

	// 观察当前页面的headers
	nextTick(() => {
		const headers = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id]");
		headers.forEach((header) => {
			observer?.observe(header);
		});
	});
};

// 监听路由变化，重新设置observer和刷新数据
watch(() => route.path, () => {
	refresh();
	setupObserver();
});

onMounted(() => {
	setupObserver();
});

onBeforeUnmount(() => {
	observer?.disconnect();
});
</script>
