<script lang="ts">
	import StepList from "$lib/components/StepList.svelte";
	import ProgressBar from "$lib/components/ProgressBar.svelte";
	import { exercises } from "$lib/stores/exercises";
	import { page } from "$app/state";
	import type { Exercise } from "$lib/types";
	import { resolve } from "$app/paths";

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
	let hasCompleted = $derived((exercise?.steps ?? []).some((s) => s.completed));

	function completeStep() {
		if (!exercise) return;

		exercises.completeCurrentStep(exercise.id);
	}

	function undoStep() {
		if (!exercise) return;
		exercises.undoLastCompletion(exercise.id);
	}
</script>

{#if exercise}
	<div class="page-layout">
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
						{currentStep?.description ?? "—"}
					</p>
					<button class="btn btn--primary btn-complete" onclick={completeStep}>
						Mark complete
					</button>
				</div>
			</section>
		{:else}
			<section class="current-section">
				<div class="complete-banner">All steps completed ✓</div>
			</section>
		{/if}

		<section class="steps-section-wrapper">
			<div class="steps-header">
				<p class="section-label">All steps</p>
				{#if hasCompleted}
					<button class="btn btn--secondary btn-undo" onclick={undoStep}>
						Undo last
					</button>
				{/if}
			</div>
			<div class="steps-section-card">
				<StepList
					steps={exercise.steps}
					currentStepIndex={exercise.currentStepIndex}
				/>
			</div>
		</section>
	</div>
{:else}
	<div class="page-layout">
		<p>Exercise not found.</p>
	</div>
{/if}

<style>
	.page-layout {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		max-width: 600px;
		width: 100%;
		margin: 0 auto;
		padding-bottom: 2rem;
	}

	.ex-header h1 {
		margin: 0;
		font-size: 1.4rem;
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
		font-size: 0.85rem;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.step-count {
		margin: 0.5rem 0 0;
		font-size: 0.85rem;
		color: var(--color-muted);
	}

	/* Etichette di sezione standardizzate (come in esercizi rapidi) */
	.section-label {
		margin: 0 0 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	/* Box passo corrente */
	.current-step-box {
		background: var(--color-card, #1c1c1e);
		border: 1px solid var(--color-border, #2c2c2e);
		border-radius: 12px;
		padding: 1.25rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.current-step-label {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.btn-complete {
		padding: 0.75rem 1.25rem;
		font-size: 0.9rem;
		font-weight: 600;
		border-radius: 8px;
		background-color: var(--color-accent, #2c974b);
		color: white;
		border: none;
		cursor: pointer;
		transition: opacity 0.2s;
		white-space: nowrap;
	}

	.btn-complete:hover {
		opacity: 0.9;
	}

	.complete-banner {
		background: rgba(44, 151, 75, 0.15); /* Accent dim */
		color: var(--color-accent, #2c974b);
		border-radius: 12px;
		padding: 1rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		text-align: center;
		border: 1px solid rgba(44, 151, 75, 0.3);
	}

	/* Sezione tutti i passi */
	.steps-section-wrapper {
		display: flex;
		flex-direction: column;
	}

	.steps-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.steps-header .section-label {
		margin: 0; /* Rimuove il margine inferiore essendoci flex-box */
	}

	.steps-section-card {
		background: var(--color-card, #1c1c1e);
		border: 1px solid var(--color-border, #2c2c2e);
		border-radius: 12px;
		padding: 1rem 1.25rem;
	}

	.btn-undo {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--color-border, #2c2c2e);
		border-radius: 6px;
		padding: 0.4rem 0.8rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-undo:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}

	/* Adattamenti per il mobile */
	@media (max-width: 480px) {
		.current-step-box {
			flex-direction: column;
			align-items: flex-start;
			gap: 1.25rem;
		}

		.btn-complete {
			width: 100%;
			text-align: center;
		}
	}
</style>
