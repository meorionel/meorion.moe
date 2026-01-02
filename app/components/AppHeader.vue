<template>
	<div>
		<div class="fixed top-0 z-50 w-full backdrop-blur-lg">
			<div class="relative z-22 mx-auto flex w-4xl items-center justify-between py-2 max-sm:w-full max-sm:px-4">
				<div class="flex items-center gap-2"><span class="text-suso-moon">meorion.moe</span> > <RandomCat /></div>
				<div class="sm:hidden" @click="isMenu = !isMenu">⠿</div>
			</div>
		</div>
		<div class="fixed top-0 left-0 z-21 h-screen w-screen px-4 pt-12 backdrop-blur-lg" v-if="isMenu">
			<div class="flex w-full flex-col gap-2">
				<AppSider />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const isMenu = ref<boolean>(false);

watch(
	() => useRoute().fullPath,
	() => {
		isMenu.value = false;
	}
);
</script>
