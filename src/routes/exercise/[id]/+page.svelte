<script lang="ts">
	import StepList from "$lib/components/StepList.svelte";
	import ProgressBar from "$lib/components/ProgressBar.svelte";
	import { exercises } from "$lib/stores/exercises";
	import { page } from "$app/state";
	import type { Exercise } from "$lib/types/exercise";

	const id = $state(page.params.id);

	let exercise: Exercise | undefined = $state(
		$exercises.find((e) => e.id === id),
	);

	exercises.subscribe((r) => {
		exercise = r.find((e) => e.id === id);
	});

	let completedCount = $derived(
		exercise?.steps.filter((s) => s.completed).length ?? 0,
	);
	let total = $derived(exercise?.steps.length ?? 0);
	let isComplete = $derived(completedCount === total);
	let pct = $derived(
		total === 0 ? 0 : Math.round((completedCount / total) * 100),
	);

	let currentStep = $derived(
		exercise?.steps[exercise.currentStepIndex] ?? null,
	);
	let hasCompleted = $derived(
		(exercise?.steps ?? []).some((s) => s.completed),
	);

	function completeStep() {
		if (!exercise) return;

		exercises.completeCurrentStep(exercise.id);
	}

	function undoStep() {
		if (!exercise) return;
		exercises.undoLastCompletion(exercise.id);
	}
</script>

<svelte:head>
	<title>{exercise?.name ?? "Exercise"} — Progressioni</title>
</svelte:head>

{#if exercise}
	<div class="page">
		<nav class="breadcrumb">
			<a href="/">← Back</a>
		</nav>

		<header class="ex-header">
			<h1>{exercise.name}</h1>
			<div class="progress-row">
				<ProgressBar {pct} />
				<span class="pct-label">{pct}%</span>
			</div>
			<p class="step-count">
				{completedCount} of {total} steps completed
			</p>
		</header>

		{#if !isComplete}
			<section class="current-section">
				<p class="section-label">Current step</p>
				<div class="current-step-box">
					<p class="current-step-label">
						{currentStep?.label ?? "—"}
					</p>
					<button class="btn-complete" onclick={completeStep}>
						Mark complete
					</button>
				</div>
			</section>
		{:else}
			<section class="current-section">
				<div class="complete-banner">All steps completed ✓</div>
			</section>
		{/if}

		<section class="steps-section">
			<div class="steps-header">
				<p class="section-label">All steps</p>
				{#if hasCompleted}
					<button class="btn-undo" onclick={undoStep}
						>Undo last</button
					>
				{/if}
			</div>
			<StepList
				steps={exercise.steps}
				currentStepIndex={exercise.currentStepIndex}
			/>
		</section>
	</div>
{:else}
	<div class="page">
		<nav class="breadcrumb"><a href="/">← Back</a></nav>
		<p>Exercise not found.</p>
	</div>
{/if}

<style>
	.page {
		max-width: 560px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
	}

	.breadcrumb {
		margin-bottom: 2rem;
	}

	.breadcrumb a {
		font-size: 0.85rem;
		color: var(--color-muted);
		text-decoration: none;
		transition: color 0.1s;
	}

	.breadcrumb a:hover {
		color: var(--color-text);
	}

	.ex-header {
		margin-bottom: 2rem;
	}

	h1 {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--color-text);
	}

	.progress-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.progress-row :global(.progress-track) {
		flex: 1;
	}

	.pct-label {
		font-size: 0.8rem;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.step-count {
		margin: 0.5rem 0 0;
		font-size: 0.8rem;
		color: var(--color-muted);
	}

	.section-label {
		margin: 0 0 0.6rem;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
	}

	.current-section {
		margin-bottom: 2.5rem;
	}

	.current-step-box {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 1.25rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.current-step-label {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.btn-complete {
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 7px;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: opacity 0.1s;
	}

	.btn-complete:hover {
		opacity: 0.85;
	}

	.complete-banner {
		background: var(--color-accent-dim);
		color: var(--color-accent);
		border-radius: 10px;
		padding: 1rem 1.5rem;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.steps-section {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 1.25rem 1.5rem;
	}

	.steps-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.4rem;
	}

	.btn-undo {
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 0.3rem 0.7rem;
		font-size: 0.75rem;
		color: var(--color-muted);
		cursor: pointer;
		transition:
			border-color 0.1s,
			color 0.1s;
	}

	.btn-undo:hover {
		border-color: var(--color-text);
		color: var(--color-text);
	}
</style>
