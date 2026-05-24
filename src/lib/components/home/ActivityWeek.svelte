<script lang="ts">
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import { daysWithActivity, getLast7Days } from "$lib/utils/activity";

	const last7 = $derived(getLast7Days());
	const activeDays = $derived(daysWithActivity($sessions, $exercises));

	console.log(daysWithActivity($sessions, $exercises))
</script>

<section class="activity-week" aria-label="Attività ultimi 7 giorni">
	<p class="ios-section-label">Ultimi 7 giorni</p>
	<div class="week-row">
		{#each last7 as day (day.date)}
			<div class="day-col">
				<div
					class="day-circle"
					class:active={activeDays.has(day.date)}
					aria-label="{day.label}: {activeDays.has(day.date)
						? 'attivo'
						: 'inattivo'}"
				></div>
				<span class="day-label">{day.label}</span>
			</div>
		{/each}
	</div>
</section>

<style>
	.activity-week {
		margin-bottom: 1.25rem;
	}

	.week-row {
		display: flex;
		justify-content: space-between;
		gap: 0.25rem;
		padding: 0.5rem 0;
	}

	.day-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.day-circle {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 2px solid var(--color-track);
		background: transparent;
		transition:
			background 0.2s ease,
			border-color 0.2s ease;
	}

	.day-circle.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.day-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-muted);
	}
</style>
