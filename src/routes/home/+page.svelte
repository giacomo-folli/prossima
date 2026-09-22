<script lang="ts">
	import ActivityWeek from "$lib/components/home/ActivityWeek.svelte";
	import SessionCadence from "$lib/components/home/SessionCadence.svelte";
	import StartSessionCard from "$lib/components/home/StartSessionCard.svelte";
	import { user } from "$lib/stores/user";
</script>

<main class="page home-page">
	<header class="home-header">
		<div class="header-text">
			<p class="page-subtitle">Bentornato/a</p>
			<h1 class="large-title">{$user?.display_name}</h1>
		</div>
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
		padding: 0.1rem 0.5rem 0.1rem;
		margin-bottom: 1.25rem;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}
</style>
