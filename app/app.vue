<template>
	<div :class="{ crt: crtShadow }">
		<header class="w-full">
			<AppHeader />
		</header>
		<main class="mx-auto flex w-4xl flex-col gap-4 pt-12 lg:flex-row">
			<div class="w-157.5">
				<Command />
				<NuxtPage />
			</div>
			<aside class="w-full shrink-0 lg:w-62.5">
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
