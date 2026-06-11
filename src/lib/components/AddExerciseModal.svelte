<script lang="ts">
	import Modal from "./Modal.svelte";
	import { exercises } from "$lib/stores/exercises";
	import { suggestExercise } from "$lib/groq";
	import Icon from "$lib/components/Icon.svelte";
	import { slide } from "svelte/transition";

	export let showModal = false;

	let name = "";
	let stepsRaw = "";
	let nameError = "";
	let stepsError = "";
	let generating = false;

	let creationMode: "manual" | "ai" = "manual";
	let goal = "";
	let currentLevel = "";

	// Watch showModal manually to wipe inputs when toggled closed
	$: if (!showModal) {
		name = "";
		stepsRaw = "";
		goal = "";
		currentLevel = "";
		creationMode = "manual";
		nameError = "";
		stepsError = "";
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

		exercises.addExercise(name.trim(), steps);
		showModal = false; // Triggers automatic reset via reactive statement
	}
</script>

<Modal bind:showModal title="Nuovo esercizio">
	<div slot="body">
		<div class="field">
			<span class="ios-section-label">Nome</span>
			<input
				id="ex-name"
				type="text"
				bind:value={name}
				placeholder="es. Squat, Plank…"
				class:input-error={!!nameError}
				autocomplete="off"
			/>
			{#if nameError}<span class="field-error">{nameError}</span>{/if}
		</div>

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
