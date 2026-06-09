<script lang="ts">
	import { page } from "$app/state";
	import { exercises } from "$lib/stores/exercises";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import Icon from "$lib/components/Icon.svelte";
	import posthog from "posthog-js";

	const id = page.params.id!;
	let exercise = $state($exercises.find((e) => e.id === id));

	exercises.subscribe((r) => {
		const found = r.find((e) => e.id === id);
		if (found && !exercise) {
			exercise = found;
		}
	});

	let name = $state("");
	let steps = $state<Array<{
		id?: string;
		description: string;
		step_index: number;
		completed: boolean;
		completed_at?: string;
	}>>([]);

	$effect(() => {
		if (exercise && name === "" && steps.length === 0) {
			name = exercise.name;
			steps = (exercise.steps ?? []).map((s) => ({ ...s }));
		}
	});

	let nameError = $state("");
	let stepsError = $state("");
	let saving = $state(false);

	function addStep() {
		steps.push({
			id: crypto.randomUUID(),
			description: "",
			step_index: steps.length,
			completed: false,
		});
	}

	function removeStep(index: number) {
		steps.splice(index, 1);
		steps.forEach((s, idx) => {
			s.step_index = idx;
		});
	}

	function moveStepUp(index: number) {
		if (index === 0) return;
		const temp = steps[index];
		steps[index] = steps[index - 1];
		steps[index - 1] = temp;
		steps.forEach((s, idx) => {
			s.step_index = idx;
		});
	}

	function moveStepDown(index: number) {
		if (index === steps.length - 1) return;
		const temp = steps[index];
		steps[index] = steps[index + 1];
		steps[index + 1] = temp;
		steps.forEach((s, idx) => {
			s.step_index = idx;
		});
	}

	async function handleSave() {
		nameError = "";
		stepsError = "";
		let valid = true;

		if (!name.trim()) {
			nameError = "Il nome è obbligatorio.";
			valid = false;
		}

		if (steps.length === 0) {
			stepsError = "Aggiungi almeno uno step.";
			valid = false;
		}

		const hasEmptyStep = steps.some((s) => !s.description.trim());
		if (hasEmptyStep) {
			stepsError = "Tutti gli step devono avere una descrizione.";
			valid = false;
		}

		if (!valid) return;

		saving = true;
		const cleanSteps = steps.map((s, idx) => ({
			id: s.id,
			description: s.description.trim(),
			step_index: idx,
			completed: s.completed,
			completed_at: s.completed_at,
		}));

		const success = await exercises.updateExercise(id, name.trim(), cleanSteps);
		saving = false;

		if (success) {
			posthog.capture("exercise_updated", {
				exercise_id: id,
				exercise_name: name.trim(),
				total_steps: cleanSteps.length,
			});
			goto(resolve("/exercises/[id]", { id }));
		} else {
			stepsError = "Errore durante il salvataggio. Riprova.";
		}
	}
</script>

{#if exercise}
	<div class="page-layout">
		<div class="top-bar">
			<a href={resolve("/exercises/[id]", { id })} class="nav-back" aria-label="Indietro">
				<Icon name="chevron-left" size={28} />
			</a>
			<h1 class="page-title">Modifica esercizio</h1>
			<button class="save-btn" onclick={handleSave} disabled={saving} aria-label="Salva esercizio">
				{#if saving}
					<span class="spinner white-spinner"></span>
				{:else}
					Salva
				{/if}
			</button>
		</div>

		<div class="edit-fields-container">
			<section class="section">
				<span class="ios-section-label">Nome dell'esercizio</span>
				<div class="ios-card field-card">
					<input
						type="text"
						bind:value={name}
						placeholder="es. Squat, Plank…"
						class:input-error={!!nameError}
						autocomplete="off"
					/>
					{#if nameError}<span class="field-error">{nameError}</span>{/if}
				</div>
			</section>

			<section class="section">
				<div class="steps-header">
					<span class="ios-section-label">Step dell'esercizio</span>
					{#if stepsError}
						<span class="field-error steps-error-msg">{stepsError}</span>
					{/if}
				</div>

				<div class="steps-list">
					{#each steps as step, index (step.step_index)}
						<div class="ios-card step-item-card">
							<div class="step-badge">
								{index + 1}
							</div>
							<div class="step-input-wrapper">
								<input
									type="text"
									bind:value={step.description}
									placeholder="es. 3 serie da 10 ripetizioni"
									autocomplete="off"
								/>
							</div>
							<div class="step-actions">
								<button
									class="action-btn order-btn"
									onclick={() => moveStepUp(index)}
									disabled={index === 0}
									title="Sposta su"
									aria-label="Sposta su"
								>
									<Icon name="chevron-left" class="rotate-90" size={18} />
								</button>
								<button
									class="action-btn order-btn"
									onclick={() => moveStepDown(index)}
									disabled={index === steps.length - 1}
									title="Sposta giù"
									aria-label="Sposta giù"
								>
									<Icon name="chevron-left" class="rotate-270" size={18} />
								</button>
								<button
									class="action-btn remove-btn"
									onclick={() => removeStep(index)}
									title="Rimuovi step"
									aria-label="Rimuovi step"
								>
									<Icon name="trash" size={18} />
								</button>
							</div>
						</div>
					{/each}
				</div>

				<button class="add-step-btn ios-card" onclick={addStep} aria-label="Aggiungi step">
					<Icon name="plus" size={18} />
					<span>Aggiungi step</span>
				</button>
			</section>
		</div>
	</div>
{:else}
	<div class="page">
		<p>Esercizio non trovato.</p>
	</div>
{/if}

<style>
	.page-layout {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-bottom: 2rem;
	}

	/* ── Top bar ── */
	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0;
	}

	.page-title {
		margin: 0;
		font-size: 20px;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
		text-align: center;
		flex: 1;
	}

	.nav-back {
		display: inline-flex;
		align-items: center;
		color: var(--color-accent);
		transition: opacity 150ms ease;
		width: 44px;
	}

	.nav-back:active {
		opacity: 0.6;
	}

	.save-btn {
		background: none;
		border: none;
		padding: 0;
		font-size: 17px;
		font-weight: 600;
		color: var(--color-accent);
		cursor: pointer;
		transition: opacity 150ms ease;
		width: 44px;
		text-align: right;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.save-btn:active:not(:disabled) {
		opacity: 0.6;
	}

	.save-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* ── Fields Layout ── */
	.edit-fields-container {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.section {
		display: flex;
		flex-direction: column;
	}

	.field-card {
		padding: 12px 16px;
	}

	.field-card input {
		width: 100%;
		border: none;
		background: transparent;
		font-size: 17px;
		font-family: inherit;
		color: var(--color-text);
		outline: none;
		padding: 0;
	}

	.field-card input.input-error {
		color: var(--color-danger);
	}

	.field-error {
		font-size: 13px;
		color: var(--color-danger);
		margin-top: 6px;
	}

	.steps-error-msg {
		margin-top: 0;
		margin-bottom: 10px;
	}

	/* ── Steps List ── */
	.steps-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.steps-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 12px;
	}

	.step-item-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
	}

	.step-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-track);
		color: var(--color-muted);
		font-size: 13px;
		font-weight: 600;
	}

	.step-input-wrapper {
		flex: 1;
		min-width: 0;
	}

	.step-input-wrapper input {
		width: 100%;
		border: none;
		background: transparent;
		font-size: 16px;
		font-family: inherit;
		color: var(--color-text);
		outline: none;
		padding: 0;
	}

	.step-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-left: auto;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: var(--color-track);
		color: var(--color-text);
		padding: 0;
		cursor: pointer;
		transition: opacity 150ms ease, background 150ms ease;
	}

	.action-btn:active:not(:disabled) {
		opacity: 0.7;
	}

	.action-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.order-btn {
		color: var(--color-muted);
		background: transparent;
	}

	.remove-btn {
		color: var(--color-danger);
		background: var(--color-danger-subtle);
	}

	:global(html.dark) .remove-btn {
		background: rgba(255, 69, 58, 0.15);
	}

	/* Spacing & Rotation */
	:global(.rotate-90) {
		transform: rotate(90deg);
	}

	:global(.rotate-270) {
		transform: rotate(270deg);
	}

	/* ── Add Step Button ── */
	.add-step-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		background: transparent;
		border: 1px dashed var(--color-border);
		color: var(--color-accent);
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		padding: 14px;
		box-shadow: none;
		transition: background 150ms ease;
	}

	.add-step-btn:active {
		background: var(--color-accent-dim);
	}

	/* Spinner */
	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-accent);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
