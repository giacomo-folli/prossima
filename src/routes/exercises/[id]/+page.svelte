<script lang="ts">
	import StepList from "$lib/components/StepList.svelte";
	import ProgressBar from "$lib/components/ProgressBar.svelte";
	import DeleteExerciseModal from "$lib/components/DeleteExerciseModal.svelte"; // <-- Component Import
	import { exercises } from "$lib/stores/exercises";
	import { page } from "$app/state";
	import type { Exercise } from "$lib/types";
	import posthog from "posthog-js";
	import { resolve } from "$app/paths";
	import Icon from "$lib/components/Icon.svelte";

	const id = $state(page.params.id);

	let exercise: Exercise | undefined = $state(
		$exercises.find((e) => e.id === id),
	);

	exercises.subscribe((r) => {
		exercise = r.find((e) => e.id === id);
	});

	let completedCount = $derived(
		exercise?.steps?.filter((s) => s.completed).length ?? 0,
	);
	let total = $derived(exercise?.steps?.length ?? 0);
	let isComplete = $derived(completedCount === total);
	let pct = $derived(
		total === 0 ? 0 : Math.round((completedCount / total) * 100),
	);

	let currentStep = $derived(
		exercise?.steps?.[exercise.current_step_index!] ?? null,
	);
	let hasCompleted = $derived((exercise?.steps ?? []).some((s) => s.completed));

	// Modal view control state triggers
	let showDeleteConfirm = $state(false);

	function completeStep() {
		if (!exercise) return;

		posthog.capture("exercise_step_completed", {
			exercise_id: exercise.id,
			exercise_name: exercise.name,
			step_index: exercise.current_step_index ?? 0,
			steps_completed: completedCount + 1,
			total_steps: total,
		});

		exercises.completeCurrentStep(exercise.id);
	}

	function undoStep() {
		if (!exercise) return;

		posthog.capture("exercise_step_undone", {
			exercise_id: exercise.id,
			exercise_name: exercise.name,
			step_index: exercise.current_step_index ?? 0,
		});

		exercises.undoLastCompletion(exercise.id);
	}
</script>

{#if exercise}
	<div class="page-layout">
		<div class="top-bar">
			<a href={resolve("/exercises")} class="nav-back" aria-label="Indietro">
				<Icon name="chevron-left" size={28} />
			</a>
		</div>

		<header class="ex-header">
			<div class="title-row">
				<h1>{exercise.name}</h1>
				<div class="actions-row">
					<a
						href={resolve("/exercises/[id]/edit", { id: exercise.id })}
						class="edit-btn"
						aria-label="Modifica esercizio"
						title="Modifica esercizio"
					>
						<Icon name="pencil" size={18} />
					</a>
					<button
						class="delete-btn"
						onclick={() => (showDeleteConfirm = true)}
						aria-label="Elimina esercizio"
						title="Elimina esercizio"
					>
						<Icon name="trash" size={18} />
					</button>
				</div>
			</div>
			<div class="progress-row">
				<ProgressBar {pct} />
				<span class="pct-label">{pct}%</span>
			</div>
			<p class="step-count">
				{completedCount} di {total} step completati
			</p>
		</header>

		{#if !isComplete}
			<section class="current-section">
				<p class="section-label">Step attuale</p>
				<div class="current-step-box ios-card">
					<p class="current-step-label">
						{currentStep?.description ?? "—"}
					</p>
					<button class="btn btn--primary btn-complete" onclick={completeStep}>
						Segna completato
					</button>
				</div>
			</section>
		{:else}
			<section class="current-section">
				<div class="complete-banner">✓ Tutti gli step completati</div>
			</section>
		{/if}

		<section class="steps-section-wrapper">
			<div class="steps-header">
				<p class="section-label">Tutti gli step</p>
				{#if hasCompleted}
					<button class="btn-undo" onclick={undoStep}> Annulla ultimo </button>
				{/if}
			</div>
			<div class="steps-section-card ios-card">
				{#if exercise.steps && exercise.current_step_index !== undefined}
					<StepList
						steps={exercise.steps}
						current_step_index={exercise.current_step_index}
					/>
				{/if}
			</div>
		</section>
	</div>
{:else}
	<div class="page">
		<p>Exercise not found.</p>
	</div>
{/if}

<DeleteExerciseModal bind:showModal={showDeleteConfirm} {exercise} />

<style>
	.page-layout {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-bottom: 2rem;
	}

	.top-bar {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 0;
	}

	.nav-back {
		display: inline-flex;
		align-items: center;
		color: var(--color-accent);
		transition: opacity 150ms ease;
	}

	.nav-back:active {
		opacity: 0.6;
	}

	.ex-header {
		padding: 0;
	}

	.title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.actions-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.edit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #e0f2fe;
		color: #0284c7;
		padding: 0;
		flex-shrink: 0;
		transition:
			opacity 150ms ease,
			transform 150ms ease;
	}

	:global(html.dark) .edit-btn {
		background: rgba(10, 132, 255, 0.2);
		color: #0a84ff;
	}

	.edit-btn:active {
		opacity: 0.8;
		transform: scale(0.96);
	}

	.ex-header h1 {
		margin: 0;
		font-size: 24px;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--color-text);
	}

	.delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #fee2e2;
		color: #ef4444;
		padding: 0;
		flex-shrink: 0;
		transition:
			opacity 150ms ease,
			transform 150ms ease;
	}

	:global(html.dark) .delete-btn {
		background: rgba(255, 69, 58, 0.2);
		color: #ff453a;
	}

	.delete-btn:active {
		opacity: 0.8;
		transform: scale(0.96);
	}

	.progress-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.progress-row :global(.progress-track) {
		flex: 1;
		height: 6px;
		border-radius: 3px;
	}

	.progress-row :global(.progress-fill) {
		border-radius: 3px;
	}

	.pct-label {
		font-size: 0.85rem;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.step-count {
		margin: 6px 0 0;
		font-size: 13px;
		color: var(--color-muted);
	}

	.section-label {
		margin: 0 0 10px;
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: var(--color-muted);
	}

	.current-section {
		padding: 0;
	}

	.current-step-box {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 16px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0;
	}

	.current-step-label {
		margin: 0 0 16px;
		font-size: 17px;
		font-weight: 700;
		color: var(--color-text);
		line-height: 1.4;
		text-align: left;
	}

	.btn-complete {
		width: 100%;
		height: 52px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: 600;
		border-radius: 14px;
		background-color: var(--color-accent);
		color: #ffffff;
		border: none;
		cursor: pointer;
		transition:
			opacity 150ms ease,
			transform 150ms ease;
		white-space: nowrap;
	}

	.btn-complete:active {
		opacity: 0.9;
		transform: scale(0.985);
	}

	.complete-banner {
		background: rgba(44, 151, 75, 0.12);
		color: var(--color-accent);
		border-radius: 16px;
		padding: 1rem 1.5rem;
		font-size: 16px;
		font-weight: 600;
		text-align: center;
		border: 1px solid rgba(44, 151, 75, 0.2);
	}

	.steps-section-wrapper {
		display: flex;
		flex-direction: column;
		padding: 0;
	}

	.steps-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.steps-header .section-label {
		margin: 0;
	}

	.steps-section-card {
		padding: 0 1rem;
	}

	.btn-undo {
		background: none;
		border: none;
		padding: 0;
		font-size: 15px;
		font-weight: 600;
		color: var(--color-accent);
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	.btn-undo:active {
		opacity: 0.6;
	}
</style>
