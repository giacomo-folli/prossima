<script lang="ts">
	import { page } from "$app/state";
	import { exercises } from "$lib/stores/exercises";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import Icon from "$lib/components/Icon.svelte";
	import posthog from "posthog-js";
	import { enhanceSteps } from "$lib/groq";
	import Modal from "$lib/components/Modal.svelte";

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

	// AI Enhancer state
	let showEnhanceModal = $state(false);
	let enhanceQuery = $state("");
	let enhancing = $state(false);
	let enhanceError = $state("");
	let previewSteps = $state<string[]>([]);
	let previewRationale = $state("");

	function openEnhance() {
		showEnhanceModal = true;
		enhanceQuery = "";
		enhanceError = "";
		previewSteps = [];
		previewRationale = "";
	}

	function closeEnhance() {
		showEnhanceModal = false;
	}

	async function generateEnhancement() {
		if (!enhanceQuery.trim()) {
			enhanceError = "Inserisci una richiesta (es. Rendi più facile).";
			return;
		}
		enhancing = true;
		enhanceError = "";
		try {
			const currentDescList = steps.map((s) => s.description).filter(Boolean);
			const result = await enhanceSteps(
				name.trim() || exercise?.name || "Esercizio",
				currentDescList,
				enhanceQuery.trim(),
			);
			if (result && result.steps && result.steps.length > 0) {
				previewSteps = result.steps;
				previewRationale = result.rationale || "";
			} else {
				enhanceError = "Errore durante la generazione. I server potrebbero essere sovraccarichi.";
			}
		} catch (err) {
			console.error("Enhancement failed:", err);
			enhanceError = "Errore di connessione. Riprova.";
		} finally {
			enhancing = false;
		}
	}

	function applyEnhancement() {
		steps = previewSteps.map((desc, idx) => ({
			id: crypto.randomUUID(),
			description: desc,
			step_index: idx,
			completed: false,
		}));
		closeEnhance();
	}

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
					<button
						type="button"
						class="ai-enhance-btn"
						onclick={openEnhance}
						aria-label="Migliora con AI"
					>
						<Icon name="sparkles" size={14} />
						<span>Migliora con AI</span>
					</button>
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

	<!-- AI Enhance Modal -->
	<Modal bind:showModal={showEnhanceModal} title="Migliora con AI">
		<div slot="body">
			<p class="enhance-intro">
				Spiega come vuoi modificare gli step (es. "rendi gli esercizi più facili per principianti" o "crea un circuito più intenso").
			</p>

			<div class="field">
				<textarea
					bind:value={enhanceQuery}
					rows="3"
					placeholder="es. Rendi più facile, aggiungi un circuito di defaticamento, ecc..."
					class:input-error={!!enhanceError}
					disabled={enhancing}
				></textarea>
				{#if enhanceError}<span class="field-error">{enhanceError}</span>{/if}
			</div>

			{#if previewSteps.length > 0}
				<div class="preview-section">
					<span class="ios-section-label">Anteprima dei nuovi step</span>
					{#if previewRationale}
						<p class="preview-rationale">💡 {previewRationale}</p>
					{/if}
					<div class="preview-list">
						{#each previewSteps as pStep, pIdx}
							<div class="preview-item">
								<span class="preview-badge">{pIdx + 1}</span>
								<span class="preview-desc">{pStep}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div slot="footer" let:closeModal>
			{#if previewSteps.length > 0}
				<button class="btn btn--secondary" onclick={closeModal} disabled={enhancing}>Annulla</button>
				<button class="btn btn--primary" onclick={applyEnhancement} disabled={enhancing}>Applica</button>
			{:else}
				<button class="btn btn--secondary" onclick={closeModal} disabled={enhancing}>Annulla</button>
				<button class="premium-ai-btn" onclick={generateEnhancement} disabled={enhancing || !enhanceQuery.trim()}>
					{#if enhancing}
						<span class="spinner white-spinner"></span> Elaborazione...
					{:else}
						<Icon name="zap" size={14} /> Genera modifiche
					{/if}
				</button>
			{/if}
		</div>
	</Modal>
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

	/* ── AI Enhance Button & Modal Styles ── */
	.ai-enhance-btn {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		background: var(--color-accent-dim);
		color: var(--color-accent);
		border: none;
		border-radius: var(--radius-card);
		padding: 0.35rem 0.75rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition:
			opacity 0.15s ease,
			transform 0.12s ease;
		margin-bottom: 10px;
	}

	.ai-enhance-btn:hover:not(:disabled) {
		opacity: 0.9;
		transform: scale(1.02);
	}

	.ai-enhance-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.enhance-intro {
		font-size: 14px;
		color: var(--color-muted);
		line-height: 1.4;
		margin: 0 0 0.5rem;
	}

	.preview-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--color-track);
		border-radius: var(--radius-card);
		padding: 12px;
		max-height: 200px;
		overflow-y: auto;
	}

	.preview-rationale {
		font-size: 13px;
		font-style: italic;
		color: var(--color-text);
		margin: 0 0 8px;
		line-height: 1.4;
	}

	.preview-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.preview-item {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		font-size: 14px;
	}

	.preview-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-card);
		color: var(--color-muted);
		font-size: 11px;
		font-weight: 600;
		margin-top: 1px;
	}

	.preview-desc {
		color: var(--color-text);
		line-height: 1.4;
		text-align: left;
	}

	/* ── Reuse Modal Layout Styles ── */
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.field textarea {
		width: 100%;
		padding: 0.6rem 0.85rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
		font-size: 16px;
		font-family: inherit;
		color: var(--color-text);
		background: var(--color-bg);
		outline: none;
		resize: vertical;
		box-sizing: border-box;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		-webkit-appearance: none;
	}

	.field textarea:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-dim);
		background: var(--color-card);
	}

	.field textarea.input-error {
		border-color: var(--color-danger);
	}

	.premium-ai-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: linear-gradient(
			135deg,
			var(--color-accent) 0%,
			var(--color-accent-light) 100%
		);
		color: #ffffff;
		border: none;
		border-radius: var(--radius-card);
		padding: 0.75rem 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 12px rgba(45, 106, 79, 0.25);
	}

	.premium-ai-btn:hover:not(:disabled) {
		opacity: 0.95;
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(45, 106, 79, 0.35);
	}

	.premium-ai-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.premium-ai-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		box-shadow: none;
	}

	.white-spinner {
		border-color: #ffffff !important;
		border-top-color: transparent !important;
	}
</style>
