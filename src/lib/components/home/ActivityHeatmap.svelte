<script lang="ts">
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import { daysWithActivity, getLast30Days, toDateKey } from "$lib/utils/activity";

	const last30 = $derived(getLast30Days());
	const activeDays = $derived(daysWithActivity($sessions, $exercises));
	const todayKey = $derived(toDateKey(new Date()));
</script>

<section class="heatmap-card ios-card">
	<div class="heatmap-header">
		<h2 class="heatmap-title">La tua costanza</h2>
		<p class="heatmap-subtitle">Ultimi 30 giorni</p>
	</div>

	<div class="heatmap-grid">
		{#each last30 as day (day)}
			<div
				class="heatmap-cell"
				class:active={activeDays.has(day)}
				class:today={day === todayKey}
			></div>
		{/each}
	</div>
</section>

<style>
	.heatmap-card {
		margin-bottom: 1.5rem;
		padding: 20px;
	}

	.heatmap-header {
		margin-bottom: 16px;
	}

	.heatmap-title {
		margin: 0;
		font-size: 1.375rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--color-text);
	}

	.heatmap-subtitle {
		margin: 2px 0 0;
		font-size: 0.8125rem;
		color: var(--color-muted);
		font-weight: 500;
	}

	.heatmap-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 6px;
	}

	.heatmap-cell {
		aspect-ratio: 1;
		border-radius: 8px;
		background: var(--color-track);
		transition: background 0.2s ease, box-shadow 0.2s ease;
	}

	:global(html.dark) .heatmap-cell {
		background: #2C2C2E;
	}

	.heatmap-cell.active {
		background: var(--color-accent);
	}

	.heatmap-cell.today {
		box-shadow: 0 0 0 2.5px var(--color-bg), 0 0 0 4.5px var(--color-accent);
	}
</style>
