<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";

	const isTraining = $derived(page.url.pathname.includes("/training"));
	const isExercises = $derived(page.url.pathname.includes("/exercises"));
	const isAnalytics = $derived(page.url.pathname.includes("/analytics"));
	const isSettings = $derived(page.url.pathname.includes("/settings"));
</script>

<nav class="tab-nav">
	<a href={resolve("/training")} class="tab" class:active={isTraining}>Home</a>
	<a href={resolve("/exercises")} class="tab" class:active={isExercises}
		>Esercizi</a
	>
	<a href={resolve("/settings")} class="tab" class:active={isSettings}
		>Impostazioni</a
	>
	<a href={resolve("/analytics")} class="tab" class:active={isAnalytics}
		>Analisi</a
	>
</nav>

<style>
	.tab-nav {
		width: 100%;
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1.75rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.tab-nav::-webkit-scrollbar {
		display: none;
	}

	.tab {
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-muted);
		padding: 0.65rem 0.65rem;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		transition:
			color 0.15s,
			border-color 0.15s;
		white-space: nowrap;
		flex-shrink: 0;
	}

	@media (min-width: 600px) {
		.tab-nav {
			margin-bottom: 2.5rem;
		}

		.tab {
			padding: 0.65rem 1.1rem;
		}
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab.active {
		color: var(--color-text);
		border-bottom-color: var(--color-accent);
	}
</style>
