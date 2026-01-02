<template>
	<div>
		<div class="mb-2">
			<div class="flex items-center gap-1">
				<span>search: </span>
				<input type="text" v-model="search" class="w-full focus:border-transparent focus:ring-0 focus:outline-none" />
			</div>
			<div class="flex gap-1">
				<span class="mr-4">sort:</span>
				<div class="flex flex-wrap">
					<span v-for="sort in uniqueSorts" :key="sort" @click="selectedSort = sort" class="mr-2 cursor-pointer">#{{ sort }}</span>
					<span @click="selectedSort = ''" v-if="selectedSort" class="cursor-pointer">[clear]</span>
				</div>
			</div>
		</div>
		<table class="w-full">
			<thead>
				<tr class="text-rose-dawn">
					<th class="w-1/10 text-left">Id</th>
					<th class="w-7/10 text-left">Info</th>
					<th class="w-2/10 text-left">Sort</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="item in filteredPosts" :key="item.path" class="cursor-pointer" @click="navigateTo(item.path)">
					<template v-if="item.pid || item.pid === 0">
						<td class="py-2 align-top">#{{ item.pid }}</td>
						<td class="py-2 align-top *:py-0!">
							<p>{{ item.title }}</p>
							<p>{{ item.date }}</p>
						</td>
						<td class="py-2 align-top">#{{ item.sort }}</td>
					</template>
				</tr>
			</tbody>
			<tbody v-if="filteredPosts.length === 0">
				<tr>
					<td class="py-2 align-top text-foam-moon">#0</td>
					<td class="py-2 align-top">'{{ search }}': No such file or directory</td>
					<td class="py-2 align-top">undefined</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts" setup>
const search = ref<string>("");
const selectedSort = ref<string>("");

const { data: posts } = await useAsyncData("blogList", () => queryCollection("blog").select("pid", "path", "title", "date", "sort").order("pid", "DESC").all());

// 计算属性：获取所有不重复的 sort 值
const uniqueSorts = computed(() => {
	if (!posts.value) {
		return [];
	}
	// 使用 Set 结构去重，并对结果进行排序
	const sorts = new Set(posts.value.map((post) => post.sort).filter((s) => s !== undefined && s !== null));
	return Array.from(sorts).sort();
});

const filteredPosts = computed(() => {
	if (!posts.value) {
		return [];
	}

	const searchQuery = search.value.toLowerCase().trim();
	const sortQuery = selectedSort.value;

	return posts.value.filter((post) => {
		// 1. 搜索条件（与您原来的逻辑相同）
		const searchMatch = !searchQuery || post.title?.toLowerCase().includes(searchQuery) || post.pid?.toString().includes(searchQuery);

		// 2. Sort 筛选条件
		// 如果 sortQuery 为空字符串（即选择了 'All'），则匹配所有；否则，要求 post.sort 严格等于 sortQuery
		const sortMatch = !sortQuery || post.sort?.toString() === sortQuery.toString();

		// 只有同时满足搜索和 Sort 筛选的文章才会被显示
		return searchMatch && sortMatch;
	});
});
</script>
