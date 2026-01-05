<template>
	<p class="break-all">
		<span class="text-suso-moon">meorionel</span>
		<span>@</span>
		<span class="text-suso-moon">meorion.moe</span>
		<span class="mx-2">></span>
		<span>{{ command }}</span>
	</p>
</template>
<script lang="ts" setup>
const route = useRoute();
const command = ref<string>("");

const fileName = computed(() => {
	return route.path === "/" ? "/index" : route.path;
});

watch(fileName, (newFileName) => {
	command.value = `cat ~/Documents${newFileName}.md`;
}, { immediate: true });
</script>
