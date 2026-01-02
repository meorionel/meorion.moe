<template>
	<li class="flex gap-2">
		<img :src="avatar" alt="friend" class="size-12" />
		<div class="flex flex-col gap-1">
			<NuxtLink :to="url" target="_blank" class="text-rose-moon underline"><slot name="name" mdc-unwrap="p" /></NuxtLink>
			<span class="text-sm opacity-75"><slot name="bio" mdc-unwrap="p" /></span>
		</div>
	</li>
</template>

<script setup>
const props = defineProps({
	avatar: {
		type: String,
		default: "/",
	},
	url: {
		type: String,
		default: "/",
	},
});
</script>
