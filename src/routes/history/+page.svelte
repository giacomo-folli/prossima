<script lang="ts">
	import SessionCadence from "$lib/components/home/SessionCadence.svelte";
</script>

<main class="page home-page">
	<header class="home-header"></header>
	<SessionCadence />
</main>

<style>
	.home-page {
		padding-bottom: 0.5rem;
	}

	.home-header {
		padding: 0.1rem 0.5rem 0.1rem;
		margin-bottom: 1.25rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
</style>
