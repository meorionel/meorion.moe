<template>
	<div :class="{ crt: crtShadow }">
		<NuxtLoadingIndicator color="#8CAD85" />
		<header class="w-full">
			<AppHeader />
		</header>
		<main class="mx-auto flex w-4xl flex-col gap-4 pt-12 lg:flex-row max-md:w-full max-md:px-2">
			<div class="w-157.5 max-md:w-full">
				<Command />
				<NuxtPage />
			</div>
			<aside class="w-62.5 shrink-0 max-md:hidden">
				<AppSider />
			</aside>
		</main>
		<footer class="w-full">
			<AppFooter />
		</footer>
	</div>
</template>

<script lang="ts" setup>
const crtShadow = useState("crtShadow");
</script>
