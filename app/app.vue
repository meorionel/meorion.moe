<template>
	<div :class="{ crt: crtShadow }">
		<NuxtLoadingIndicator color="#8CAD85" />
		<header class="w-full">
			<AppHeader />
		</header>
		<main class="mx-auto flex w-4xl flex-col gap-4 pt-12 max-md:w-full max-md:px-2 lg:flex-row">
			<div class="w-157.5 max-md:w-full">
				<Command />
				<div class="overflow-scroll md:h-[calc(100vh-92px)] mt-2">
					<NuxtPage />
				</div>
			</div>
			<aside class="w-62.5 shrink-0 max-md:hidden">
				<AppSider />
			</aside>
		</main>
	</div>
</template>

<script lang="ts" setup>
const crtShadow = useState("crtShadow");
</script>
