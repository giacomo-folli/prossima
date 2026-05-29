<script lang="ts">
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import { daysWithActivity, getLast7Days, toDateKey } from "$lib/utils/activity";

	const last7 = $derived(getLast7Days());
	const activeDays = $derived(daysWithActivity($sessions, $exercises));
	const todayKey = $derived(toDateKey(new Date()));
</script>

<section class="activity-week" aria-label="Attività ultimi 7 giorni">
	<p class="ios-section-label">Ultimi 7 giorni</p>
	<div class="week-row">
		{#each last7 as day (day.date)}
			<div class="day-col">
				<div
					class="day-circle"
					class:active={activeDays.has(day.date)}
					class:today={day.date === todayKey}
					aria-label="{day.label}: {activeDays.has(day.date)
						? 'attivo'
						: 'inattivo'}"
				></div>
				<span class="day-label" class:today={day.date === todayKey}>{day.label}</span>
			</div>
		{/each}
	</div>
</section>

<style>
	.activity-week {
		margin-bottom: 1.5rem;
		padding: 0 1rem;
	}

	.ios-section-label {
		display: block;
		margin: 0 0 12px;
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: var(--color-muted);
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
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #E5E7EB;
		transition:
			background 0.2s ease,
			box-shadow 0.2s ease;
	}

	:global(html.dark) .day-circle {
		background: #2C2C2E;
	}

	.day-circle.active {
		background: var(--color-accent);
	}

	.day-circle.today {
		box-shadow: 0 0 0 2.5px var(--color-bg), 0 0 0 4.5px var(--color-accent);
	}

	.day-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--color-muted);
	}

	.day-label.today {
		color: var(--color-accent);
		font-weight: 700;
	}
</style>
