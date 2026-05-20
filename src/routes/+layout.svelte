<script lang="ts">
	import "../app.css";
	import Nav from "$lib/components/Nav.svelte";
	import { pwaInfo } from "virtual:pwa-info";
	import { onMount, type Snippet } from "svelte";

	let pwaWebManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : "");

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import("virtual:pwa-register");
			registerSW({ immediate: true });
		}
	});

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<!-- Inietta il tag del manifest generato da Vite -->
	{@html pwaWebManifest}

	<script
		async
		src="https://cdn.jsdelivr.net/npm/pwacompat"
		crossorigin="anonymous"
	></script>
</svelte:head>

<div class="shell">
	<Nav />
	{@render children()}
</div>

<style>
	.shell {
		max-width: 960px;
		margin: 0 auto;
		padding: 1.25rem 1rem 4rem;

		overflow-y: auto;
		height: 100%;
		-webkit-overflow-scrolling: touch;
	}

	@media (min-width: 600px) {
		.shell {
			padding: 2rem 1.5rem 4rem;
		}
	}
</style>
