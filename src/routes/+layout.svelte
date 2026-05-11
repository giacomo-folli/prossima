<script lang="ts">
	import "../app.css";
	import Nav from "$lib/components/Nav.svelte";

	let { children } = $props();
</script>

<div class="shell">
	<Nav />
	{@render children()}
</div>

<style>
	.shell {
		max-width: 960px;
		margin: 0 auto;
		padding: 1.5rem;
	}
</style>
