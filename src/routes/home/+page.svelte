<script lang="ts">
	import ActivityWeek from "$lib/components/home/ActivityWeek.svelte";
	import SessionCadence from "$lib/components/home/SessionCadence.svelte";
	import StartSessionCard from "$lib/components/home/StartSessionCard.svelte";
</script>

<main class="page home-page">
	<header class="home-header">
		<p class="page-subtitle">Bentornato</p>
		<h1 class="large-title">Bro</h1>
	</header>

	<StartSessionCard />
	<ActivityWeek />
	<SessionCadence />
</main>

<style>
	.home-page {
		padding-bottom: 0.5rem;
	}

	.home-header {
		padding: 0.1rem 1rem 0.1rem;
		margin-bottom: 1.25rem;
	}
</style>
