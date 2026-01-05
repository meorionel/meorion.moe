<template>
	<div>
		<template v-if="page">
			<ProseHeader :value="{ title: page.title, date: page.meta.date, sort: page.meta.sort }" />
			<ContentRenderer :value="page" class="prose" />
		</template>
		<template v-else>
			<p>cat: Documents{{ fileName }}.md: No such file or directory</p>
		</template>
	</div>
</template>

<script lang="ts" setup>
const route = useRoute();
const fileName = computed(() => {
	return route.path === "/" ? "/index" : route.path;
});
const { data: page, error } = await useAsyncData(route.path, () => queryCollection("page").path(route.path).first());

useHead({
	title: `${page.value?.title ? page.value?.title : "hhi!"} - s22y.moe`,
});
</script>
