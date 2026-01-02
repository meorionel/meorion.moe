<template>
	<div class="flex items-center">
		<span class="text-suso-moon">meorionel</span>
		<span>@</span>
		<span class="text-suso-moon">meorion.moe</span>
		<span class="mx-2">></span>
		<span>{{ command }}</span>
	</div>
</template>
<script lang="ts" setup>
const route = useRoute();
const command = ref<string>("");

const fileName = computed(() => {
	return route.path === "/" ? "/index" : route.path;
});
command.value = `cat ~/Documents${fileName.value}.md`;
</script>
