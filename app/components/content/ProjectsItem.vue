<template>
	<li class="flex flex-col">
		<div>
			<span class="mr-2">-</span>
			<span class="text-rose-moon"><slot name="name" mdc-unwrap="p" /></span>
		</div>
		<div class="flex flex-col ml-4">
			<span><slot name="description" mdc-unwrap="p" /></span>
			<NuxtLink :to="url" target="_blank" class="break-all underline">{{ url }}</NuxtLink>
		</div>
	</li>
</template>

<script setup>
const props = defineProps({
	url: {
		type: String,
		default: "/",
	},
});
</script>
