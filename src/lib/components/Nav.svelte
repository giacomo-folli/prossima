<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";

	const isHome = $derived(page.url.pathname.includes("/home"));
	const isExercises = $derived(page.url.pathname.includes("/exercises"));
	const isAnalytics = $derived(page.url.pathname.includes("/analytics"));
	const isSettings = $derived(page.url.pathname.includes("/settings"));
</script>

<nav class="tab-bar" aria-label="Navigazione principale">
	<a href={resolve("/home")} class="tab" class:active={isHome}>
		<i class="ti ti-home tab-icon" aria-hidden="true"></i>
		<span class="tab-label">Home</span>
	</a>
	<a href={resolve("/exercises")} class="tab" class:active={isExercises}>
		<i class="ti ti-barbell tab-icon" aria-hidden="true"></i>
		<span class="tab-label">Esercizi</span>
	</a>
	<a href={resolve("/analytics")} class="tab" class:active={isAnalytics}>
		<i class="ti ti-chart-bar tab-icon" aria-hidden="true"></i>
		<span class="tab-label">Analisi</span>
	</a>
	<a href={resolve("/settings")} class="tab" class:active={isSettings}>
		<i class="ti ti-settings tab-icon" aria-hidden="true"></i>
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
		height: var(--tab-bar-height);
		padding-bottom: env(safe-area-inset-bottom, 0px);
		display: flex;
		align-items: stretch;
		justify-content: space-around;
		background: var(--color-tab-bar);
		backdrop-filter: blur(20px) saturate(1.8);
		-webkit-backdrop-filter: blur(20px) saturate(1.8);
		border-top: 0.5px solid var(--color-border);
	}

	.tab {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.125rem;
		text-decoration: none;
		color: var(--color-muted);
		min-height: 44px;
		padding-top: 1.5rem;
		transition: color 0.15s ease;
	}

	.tab-icon {
		font-size: 1.35rem;
		line-height: 1;
	}

	.tab-label {
		font-size: 0.625rem;
		font-weight: 500;
		letter-spacing: 0.01em;
	}

	.tab.active {
		color: var(--color-accent);
	}

	.tab.active .tab-icon {
		font-weight: 600;
	}
</style>
