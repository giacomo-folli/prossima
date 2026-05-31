<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Icon from "./Icon.svelte";

	const isHome = $derived(page.url.pathname.includes("/home"));
	const isExercises = $derived(page.url.pathname.includes("/exercises"));
	const isAnalytics = $derived(page.url.pathname.includes("/analytics"));
	const isSettings = $derived(page.url.pathname.includes("/settings"));
</script>

<nav class="tab-bar" aria-label="Navigazione principale">
	<a href={resolve("/home")} class="tab" class:active={isHome}>
		<Icon name="house" size={24} />
		<span class="tab-label">Home</span>
	</a>
	<a href={resolve("/exercises")} class="tab" class:active={isExercises}>
		<Icon name="dumbbell" size={24} />
		<span class="tab-label">Esercizi</span>
	</a>
	<a href={resolve("/analytics")} class="tab" class:active={isAnalytics}>
		<Icon name="chart-column" size={24} />
		<span class="tab-label">Analisi</span>
	</a>
	<a href={resolve("/settings")} class="tab" class:active={isSettings}>
		<Icon name="settings" size={24} />
		<span class="tab-label">Impostazioni</span>
	</a>
</nav>

<style>
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		height: calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px));
		/* padding-bottom: env(safe-area-inset-bottom, 0px); */
		display: flex;
		align-items: stretch;
		justify-content: space-around;
		background: var(--color-tab-bar);
		backdrop-filter: blur(20px) saturate(1.8);
		-webkit-backdrop-filter: blur(20px) saturate(1.8);
		border-top: 1px solid var(--color-border);
	}

	.tab {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		text-decoration: none;
		color: var(--color-muted);
		min-height: 44px;
		padding-top: 10px;
		transition: color 0.15s ease;
	}

	.tab-label {
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.01em;
	}

	.tab.active {
		color: var(--color-accent);
	}
</style>
