<script lang="ts">
	import Modal from "./Modal.svelte";
	import { exercises } from "$lib/stores/exercises";
	import { suggestExercise } from "$lib/groq";
	import Icon from "$lib/components/Icon.svelte";
	import { slide } from "svelte/transition";
	import {
		loadExerciseLibrary,
		searchExerciseTemplates,
	} from "$lib/utils/exercise-library";
	import { EXERCISE_CATEGORY_LABELS_IT } from "$lib/constants";
	import type { ExerciseTemplate } from "$lib/types";

	export let showModal = false;

	let name = "";
	let stepsRaw = "";
	let nameError = "";
	let stepsError = "";
	let generating = false;

	let creationMode: "manual" | "ai" = "manual";
	let goal = "";
	let currentLevel = "";

	// --- Autocomplete dal catalogo esercizi ---
	let library: ExerciseTemplate[] = [];
	let suggestions: ExerciseTemplate[] = [];
	let showSuggestions = false;
	let selectedTemplate: ExerciseTemplate | null = null;

	// Carica il catalogo (una sola volta, con cache di modulo) all'apertura del modale
	$: if (showModal && library.length === 0) {
		loadExerciseLibrary().then((data) => (library = data));
	}

	function categoryLabel(category: string): string {
		return EXERCISE_CATEGORY_LABELS_IT[category] ?? category;
	}

	function capitalize(text: string): string {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	function onNameInput() {
		// Digitando manualmente il nome si scollega dal template selezionato
		if (selectedTemplate && name.trim() !== capitalize(selectedTemplate.name)) {
			selectedTemplate = null;
		}
		const q = name.trim();
		if (q.length < 2) {
			suggestions = [];
			showSuggestions = false;
			return;
		}
		suggestions = searchExerciseTemplates(library, q).slice(0, 8);
		showSuggestions = suggestions.length > 0;
	}

	function pickTemplate(template: ExerciseTemplate) {
		selectedTemplate = template;
		name = capitalize(template.name);
		suggestions = [];
		showSuggestions = false;
		nameError = "";
		stepsError = "";
		creationMode = "manual";
	}

	// Watch showModal manually to wipe inputs when toggled closed
	$: if (!showModal) {
		name = "";
		stepsRaw = "";
		goal = "";
		currentLevel = "";
		creationMode = "manual";
		nameError = "";
		stepsError = "";
		suggestions = [];
		showSuggestions = false;
		selectedTemplate = null;
	}

	async function generateStepsWithAI() {
		if (!name.trim()) {
			nameError = "Inserisci prima il nome dell'esercizio.";
			return;
		}

		generating = true;
		nameError = "";
		stepsError = "";

		try {
			const suggestion = await suggestExercise(
				name.trim(),
				goal.trim(),
				currentLevel.trim(),
			);
			if (suggestion) {
				stepsRaw = suggestion.steps.join("\n");
				if (
					suggestion.name &&
					name.toLowerCase().trim() !== suggestion.name.toLowerCase().trim()
				) {
					name = suggestion.name;
				}
			} else {
				stepsError =
					"I server Groq sono temporaneamente sovraccarichi. Attendi qualche istante e riprova.";
			}
		} catch (err: any) {
			console.error("AI generation failed:", err);
			const msg = String(err).toLowerCase();
			if (
				msg.includes("503") ||
				msg.includes("unavailable") ||
				msg.includes("demand") ||
				msg.includes("busy")
			) {
				stepsError =
					"I server di Google sono temporaneamente sovraccarichi. Riprova tra qualche istante.";
			} else {
				stepsError =
					"Errore durante la generazione. Verifica la tua connessione e riprova.";
			}
		} finally {
			generating = false;
		}
	}

	function handleSubmit() {
		nameError = "";
		stepsError = "";
		let valid = true;

		if (!name.trim()) {
			nameError = "Il nome è obbligatorio.";
			valid = false;
		}

		const steps = stepsRaw
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean);
		if (steps.length === 0) {
			stepsError = "Aggiungi almeno uno step.";
			valid = false;
		}

		if (!valid) return;

		// Se il nome combacia ancora col template selezionato, salvo la gif
		const gif =
			selectedTemplate && name.trim() === capitalize(selectedTemplate.name)
				? selectedTemplate.gif_url
				: undefined;

		exercises.addExercise(name.trim(), steps, gif);
		showModal = false; // Triggers automatic reset via reactive statement
	}
</script>

<Modal bind:showModal title="Nuovo esercizio">
	<div slot="body">
		<div class="field">
			<span class="ios-section-label">Nome</span>
			<div class="autocomplete">
				<input
					id="ex-name"
					type="text"
					bind:value={name}
					on:input={onNameInput}
					on:focus={onNameInput}
					placeholder="es. Squat, Plank…"
					class:input-error={!!nameError}
					autocomplete="off"
					role="combobox"
					aria-expanded={showSuggestions}
					aria-controls="ex-suggestions"
				/>

				{#if showSuggestions}
					<ul
						id="ex-suggestions"
						class="suggestions ios-card"
						transition:slide={{ duration: 150 }}
					>
						{#each suggestions as s (s.id)}
							<li>
								<button
									type="button"
									class="suggestion"
									on:click={() => pickTemplate(s)}
								>
									<img
										class="suggestion-thumb"
										src={s.image_url}
										alt=""
										loading="lazy"
									/>
									<span class="suggestion-text">
										<span class="suggestion-name">{capitalize(s.name)}</span>
										<span class="suggestion-meta">
											{categoryLabel(s.category)} · {s.target}
										</span>
									</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			{#if nameError}<span class="field-error">{nameError}</span>{/if}
		</div>

		{#if selectedTemplate}
			<div class="template-preview ios-card" transition:slide={{ duration: 200 }}>
				<img
					class="preview-gif"
					src={selectedTemplate.gif_url}
					alt={selectedTemplate.name}
					loading="lazy"
				/>
				<div class="preview-info">
					<span class="preview-name">{capitalize(selectedTemplate.name)}</span>
					<span class="preview-meta">
						{categoryLabel(selectedTemplate.category)} · {selectedTemplate.equipment}
					</span>
					<span class="preview-attr">{selectedTemplate.attribution}</span>
				</div>
			</div>
		{/if}

		<div class="segmented-control">
			<button
				type="button"
				class="segment-btn"
				class:active={creationMode === "manual"}
				on:click={() => (creationMode = "manual")}
			>
				<Icon name="pencil" size={14} /> Manuale
			</button>
			<button
				type="button"
				class="segment-btn"
				class:active={creationMode === "ai"}
				on:click={() => (creationMode = "ai")}
			>
				<Icon name="sparkles" size={14} /> Genera con AI
			</button>
		</div>

		{#if creationMode === "ai"}
			<div transition:slide={{ duration: 200 }} class="ai-fields">
				<div class="field">
					<span class="ios-section-label">Obiettivo (Goal)</span>
					<input
						id="ex-goal"
						type="text"
						bind:value={goal}
						placeholder="es. 3 serie da 10 reps, 5 minuti, 50kg..."
						autocomplete="off"
					/>
				</div>

				<div class="field">
					<span class="ios-section-label">Livello attuale</span>
					<input
						id="ex-level"
						type="text"
						bind:value={currentLevel}
						placeholder="es. 3 serie da 5 reps, principiante..."
						autocomplete="off"
					/>
				</div>

				<button
					type="button"
					class="premium-ai-btn"
					on:click={generateStepsWithAI}
					disabled={generating || !name.trim()}
					aria-label="Genera step con AI"
				>
					{#if generating}
						<span class="spinner white-spinner"></span> Generazione in corso...
					{:else}
						<Icon name="zap" size={14} /> Genera piano con AI
					{/if}
				</button>
			</div>
		{/if}

		<div class="field">
			<div class="field-header-row">
				<span class="ios-section-label">
					Step <span class="label-hint">— uno per riga</span>
				</span>
			</div>
			<textarea
				id="ex-steps"
				bind:value={stepsRaw}
				rows="5"
				placeholder={"3 serie da 10 ripetizioni\nRiposo 60s\nAumenta peso se facile"}
				class:input-error={!!stepsError}
			></textarea>
			{#if stepsError}<span class="field-error">{stepsError}</span>{/if}
		</div>
	</div>

	<div slot="footer" let:closeModal>
		<button class="btn btn--secondary" on:click={closeModal}>Annulla</button>
		<button class="btn btn--primary" on:click={handleSubmit}>Aggiungi</button>
	</div>
</Modal>

<style>
	/* Styles specific only to this form layout context */
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.field-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.spinner {
		width: 10px;
		height: 10px;
		border: 1.5px solid var(--color-accent);
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.field :global(.ios-section-label),
	.field .ios-section-label {
		margin-bottom: 0;
	}

	.label-hint {
		font-weight: 400;
		text-transform: none;
		letter-spacing: 0;
		color: var(--color-muted);
	}

	.field input,
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

	.field input {
		resize: none;
	}

	.field input:focus,
	.field textarea:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-dim);
		background: var(--color-card);
	}

	.field input.input-error,
	.field textarea.input-error {
		border-color: var(--color-danger);
	}

	.field-error {
		font-size: 0.75rem;
		color: var(--color-danger);
	}

	/* --- Autocomplete --- */
	.autocomplete {
		position: relative;
	}

	.suggestions {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: 20;
		margin: 0;
		padding: 4px;
		list-style: none;
		max-height: 260px;
		overflow-y: auto;
		background: var(--color-card);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-card);
	}

	.suggestion {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		width: 100%;
		padding: 0.4rem 0.5rem;
		border: none;
		background: transparent;
		border-radius: 10px;
		cursor: pointer;
		text-align: left;
	}

	.suggestion:hover,
	.suggestion:focus-visible {
		background: var(--color-track);
	}

	.suggestion-thumb {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		border-radius: 8px;
		object-fit: cover;
		background: var(--color-track);
	}

	.suggestion-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.suggestion-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.suggestion-meta {
		font-size: 0.75rem;
		color: var(--color-muted);
		text-transform: capitalize;
	}

	/* --- Anteprima template selezionato --- */
	.template-preview {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		padding: 0.6rem;
		margin-top: 0.6rem;
		background: var(--color-card);
		border: 1px solid var(--color-border);
	}

	.preview-gif {
		width: 72px;
		height: 72px;
		flex-shrink: 0;
		border-radius: 10px;
		object-fit: cover;
		background: var(--color-track);
	}

	.preview-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.preview-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.preview-meta {
		font-size: 0.78rem;
		color: var(--color-muted);
		text-transform: capitalize;
	}

	.preview-attr {
		font-size: 0.68rem;
		color: var(--color-muted);
		opacity: 0.8;
		margin-top: 0.1rem;
	}

	.segmented-control {
		display: flex;
		background: var(--color-track);
		border-radius: var(--radius-card);
		padding: 3px;
		margin-block: 0.5rem;
	}

	.segment-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		border: none;
		background: transparent;
		color: var(--color-muted);
		padding: 0.5rem;
		font-size: 0.85rem;
		font-weight: 600;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		height: 36px;
	}

	.segment-btn:active {
		transform: scale(0.97);
	}

	.segment-btn.active {
		background: var(--color-card);
		color: var(--color-accent);
		box-shadow: var(--shadow-card);
	}

	.ai-fields {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow: hidden;
	}

	.premium-ai-btn {
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
		margin-bottom: 1rem;
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
