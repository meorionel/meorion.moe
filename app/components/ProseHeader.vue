<template>
	<div class="mt-4 flex flex-col gap-2">
		<p class="bg-suso-moon px-2 text-lg font-bold text-white">{{ value.title }}</p>
		<p class="text-sm opacity-75"><NuxtTime :datetime="value.date" format="YYYY-MM-DD" /> - #{{ value.sort }}</p>
	</div>
</template>

<script lang="ts" setup>
defineProps({
	value: {
		type: Object,
		default: () => ({
			title: "",
			date: "",
			sort: "",
		}),
	},
});
</script>
