<script lang="ts">
	import "../app.css";
	import Nav from "$lib/components/Nav.svelte";
	import type { Snippet } from "svelte";
	let { children }: { children: Snippet } = $props();
</script>

<div class="shell">
	<Nav />
	{@render children()}
</div>

<style>
	.shell {
		max-width: 960px;
		margin: 0 auto;
		padding: 1.25rem 1rem 4rem;
	}

	@media (min-width: 600px) {
		.shell {
			padding: 2rem 1.5rem 4rem;
		}
	}
</style>
