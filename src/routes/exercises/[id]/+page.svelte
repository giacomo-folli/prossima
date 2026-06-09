<script lang="ts">
	import StepList from "$lib/components/StepList.svelte";
	import ProgressBar from "$lib/components/ProgressBar.svelte";
	import { exercises } from "$lib/stores/exercises";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
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

	// Delete confirmation state
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

	function confirmDelete() {
		showDeleteConfirm = true;
	}

	function cancelDelete() {
		showDeleteConfirm = false;
	}

	function deleteExercise() {
		if (!exercise) return;

		posthog.capture("exercise_deleted", {
			exercise_id: exercise.id,
			exercise_name: exercise.name,
		});

		exercises.remove(exercise.id);
		goto(resolve("/exercises"));
	}

	function handleBackdropClick(e: MouseEvent) {
		if ((e.target as HTMLElement).classList.contains("confirm-backdrop")) {
			cancelDelete();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") cancelDelete();
	}
</script>

<svelte:window on:keydown={handleKeydown} />
<svelte:body class:no-scroll={showDeleteConfirm} />

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
						onclick={confirmDelete}
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
					<button class="btn-undo" onclick={undoStep}>
						Annulla ultimo
					</button>
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

<!-- Delete confirmation sheet -->
{#if showDeleteConfirm}
	<div
		class="confirm-backdrop"
		role="presentation"
		onclick={handleBackdropClick}
	>
		<div
			class="confirm-sheet ios-card"
			role="dialog"
			aria-modal="true"
			aria-labelledby="confirm-title"
		>
			<div class="drag-handle"></div>

			<div class="confirm-body">
				<div class="confirm-icon">
					<Icon name="trash" size={24} />
				</div>
				<h2 id="confirm-title">Elimina esercizio</h2>
				<p class="confirm-desc">
					Vuoi eliminare <strong>{exercise?.name}</strong>? Questa azione non
					può essere annullata.
				</p>
			</div>

			<div class="confirm-actions">
				<button
					class="btn btn--danger confirm-delete-btn"
					onclick={deleteExercise}
				>
					Elimina
				</button>
				<button
					class="btn btn--secondary confirm-cancel-btn"
					onclick={cancelDelete}
				>
					Annulla
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page-layout {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-bottom: 2rem;
	}

	/* ── Top bar & Back nav ── */
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

	/* ── Header ── */
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

	/* ── Edit button ── */
	.edit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #E0F2FE;
		color: #0284C7;
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

	/* ── Delete button ── */
	.delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: #FEE2E2;
		color: #EF4444;
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

	/* ── Section Label ── */
	.section-label {
		margin: 0 0 10px;
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: var(--color-muted);
	}

	/* ── Current Section ── */
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
		transition: opacity 150ms ease, transform 150ms ease;
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

	/* ── Steps Section ── */
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

	/* ── Confirm sheet ── */
	.confirm-backdrop {
		position: fixed;
		inset: 0;
		background: var(--color-overlay);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		z-index: 100;
		animation: fade-in 0.18s ease;
	}

	@media (min-width: 520px) {
		.confirm-backdrop {
			align-items: center;
			padding: 1rem;
		}
	}

	.confirm-sheet {
		width: 100%;
		max-width: 480px;
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		padding: 0;
		box-shadow: var(--shadow-elevated);
		animation: slide-up 0.24s cubic-bezier(0.32, 1.2, 0.6, 1);
		overflow: hidden;
	}

	@media (min-width: 520px) {
		.confirm-sheet {
			border-radius: var(--radius-lg);
			animation: pop-in 0.22s cubic-bezier(0.32, 1.2, 0.6, 1);
		}
	}

	.drag-handle {
		width: 36px;
		height: 4px;
		border-radius: 2px;
		background: var(--color-track);
		margin: 0.75rem auto 0;
	}

	@media (min-width: 520px) {
		.drag-handle {
			display: none;
		}
	}

	.confirm-body {
		padding: 1.5rem 1.5rem 1rem;
		text-align: center;
	}

	.confirm-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: rgba(255, 59, 48, 0.12);
		color: var(--color-danger);
		font-size: 1.4rem;
		margin-bottom: 0.85rem;
	}

	.confirm-body h2 {
		margin: 0 0 0.5rem;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
	}

	.confirm-desc {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-muted);
		line-height: 1.5;
	}

	.confirm-desc strong {
		color: var(--color-text);
		font-weight: 600;
	}

	.confirm-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.5rem 1.25rem 1.5rem;
	}

	.confirm-delete-btn,
	.confirm-cancel-btn {
		width: 100%;
		text-align: center;
		border-radius: var(--radius-card);
		padding: 0.8rem;
		font-size: 0.95rem;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-up {
		from {
			transform: translateY(56px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes pop-in {
		from {
			transform: scale(0.93);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
