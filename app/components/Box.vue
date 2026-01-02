<template>
	<div class="border-suso-moon relative border px-4 py-2" :class="{ 'py-3': title }">
		<div class="text-suso-moon absolute -top-3 left-4 bg-black/40 px-2 font-bold backdrop-blur-md">{{ title }}</div>
		<slot />
	</div>
</template>

<script lang="ts" setup>
defineProps({
	title: {
		type: String,
		default: "",
	},
});
</script>
