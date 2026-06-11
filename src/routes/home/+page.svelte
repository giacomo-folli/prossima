<script lang="ts">
	import ActivityWeek from "$lib/components/home/ActivityWeek.svelte";
	import SessionCadence from "$lib/components/home/SessionCadence.svelte";
	import StartSessionCard from "$lib/components/home/StartSessionCard.svelte";
	import { user } from "$lib/stores/user";
	import Icon from "$lib/components/Icon.svelte";
	import { resolve } from "$app/paths";
</script>

<main class="page home-page">
	<header class="home-header">
		<div class="header-text">
			<p class="page-subtitle">Bentornato/a</p>
			<h1 class="large-title">{$user?.display_name}</h1>
		</div>
		<a href={resolve("/feed")} class="feed-link" aria-label="Feed Attività">
			<Icon name="sparkles" size={18} />
		</a>
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

	.feed-link {
		color: var(--color-muted);
		opacity: 0.45;
		padding: 6px;
		margin-top: 4px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: opacity 0.2s, background-color 0.2s;
	}

	.feed-link:hover {
		opacity: 0.8;
		background-color: var(--color-border);
	}
</style>
