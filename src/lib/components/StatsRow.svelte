<script lang="ts">
	import { exercises } from "$lib/stores/exercises";
	import type { Step } from "$lib/types";
	import ProgressBar from "./ProgressBar.svelte";

	const totalSteps = $derived.by(() =>
		$exercises.reduce((prev, curr) => prev + curr.steps.length, 0),
	);
	const completedSteps = $derived.by(() =>
		$exercises.reduce(
			(prev, curr) => prev + curr.steps.filter((s) => s.completed).length,
			0,
		),
	);
	const exercisesCompleted = $derived.by(
		() =>
			$exercises.filter((ex) => ex.steps.every((s) => s.completed))
				.length,
	);
	const exercisesStarted = $derived.by(
		() =>
			$exercises.filter((ex) => ex.steps.some((s) => !s.completed))
				.length,
	);

	const overallPercent = $derived(
		Math.round((completedSteps / totalSteps) * 100),
	);

	// reactively calculate from the $store.
	let lastCompleted = $derived.by(() => {
		let latest: (Step & { exercise?: any }) | undefined = undefined;

		if ($exercises) {
			for (const ex of $exercises) {
				for (const step of ex.steps) {
					if (!step.completedAt) continue;

					if (
						!latest?.completedAt ||
						new Date(latest.completedAt) <
							new Date(step.completedAt)
					) {
						latest = { ...step, exercise: ex };
					}
				}
			}
		}

		return latest;
	});

	let formattedDate = $derived(
		lastCompleted?.completedAt
			? new Date(lastCompleted.completedAt).toLocaleDateString("it-IT", {
					day: "numeric",
					month: "short",
				})
			: "",
	);
</script>

<div class="stats-section">
	<!-- Stats row -->
	<div class="stats-grid">
		<div class="stat-card">
			{#if lastCompleted}
				<p class="stat-label">Last trained</p>
				<p class="stat-value">{lastCompleted.exercise?.name}</p>
				<p class="stat-label">
					{lastCompleted.description} — {formattedDate}
				</p>
			{:else}
				<span>No step completed yet</span>
			{/if}
		</div>
		<div class="stat-card">
			<p class="stat-label">Steps done</p>
			<p class="stat-value">{completedSteps}</p>
		</div>
		<div class="stat-card">
			<p class="stat-label">In progress</p>
			<p class="stat-value">{exercisesStarted}</p>
		</div>
		<div class="stat-card">
			<p class="stat-label">Completed</p>
			<p class="stat-value">{exercisesCompleted}</p>
		</div>
	</div>

	<div class="progress-bar">
		<div class="progress-label">Progress: {overallPercent}%</div>

		<ProgressBar pct={overallPercent}></ProgressBar>
	</div>
</div>

<style>
	.progress-label {
		font-size: 0.75rem; /* text-xs */
		line-height: 1rem;
		color: var(--muted-foreground, #71717a); /* text-muted-foreground */
		margin: 0.125rem 0 0 0; /* mt-0.5 and reset others */
		min-width: fit-content;
	}

	.progress-bar {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 1em;
		margin-block: 1rem;
	}

	.stats-section {
		margin-block-end: 1.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem; /* gap-3 */
	}

	.stat-card {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 1.25rem 1.5rem;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}

	.stat-value {
		/* color: var(--foreground, #09090b); text-foreground */
		font-size: 1.25rem;
		line-height: 1.8rem;
		font-weight: 600; /* font-semibold */
		font-variant-numeric: tabular-nums; /* tabular-nums */
		margin: 0;
	}

	.stat-label {
		font-size: 0.75rem; /* text-xs */
		line-height: 1rem;
		color: var(--muted-foreground, #71717a); /* text-muted-foreground */
		margin: 0.125rem 0 0 0; /* mt-0.5 and reset others */
	}

	/* .last-activity {
		font-size: 0.75rem; 
		line-height: 1rem;
		color: var(--muted-foreground, #71717a);
		margin-top: 0.5rem; 
		margin-bottom: 0;
	} */
</style>
