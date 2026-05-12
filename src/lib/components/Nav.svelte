<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";

	const isTraining = $derived(page.url.pathname.includes("/training"));
	const isSettings = $derived(page.url.pathname.includes("/settings"));
	const isHome = $derived(!isTraining && !isSettings);
</script>

<nav class="tab-nav">
	<a href={resolve("/training")} class="tab" class:active={isTraining}
		>Allenamento</a
	>
	<a href={resolve("/exercises")} class="tab" class:active={isHome}>Esercizi</a>
	<a href={resolve("/settings")} class="tab" class:active={isSettings}
		>Impostazioni</a
	>
</nav>

<style>
	.tab-nav {
		display: flex;
		gap: 0;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1.5rem;
	}

	.tab {
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-muted);
		padding: 0.65rem 1.1rem;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab.active {
		color: var(--color-text);
		border-bottom-color: var(--color-accent);
	}
</style>
