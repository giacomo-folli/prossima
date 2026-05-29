<script lang="ts">
	import ExerciseCard from "$lib/components/ExerciseCard.svelte";
	import { exerciseProgress, exercises } from "$lib/stores/exercises";
	import { suggestExercise } from "$lib/gemini";

	let showModal = false;
	let name = "";
	let stepsRaw = "";
	let nameError = "";
	let stepsError = "";
	let generating = false;

	async function generateStepsWithAI() {
		if (!name.trim()) {
			nameError = "Inserisci prima il nome dell'esercizio.";
			return;
		}

		generating = true;
		nameError = "";
		stepsError = "";

		try {
			const suggestion = await suggestExercise(name.trim());
			if (suggestion) {
				stepsRaw = suggestion.steps.join("\n");
				if (suggestion.name && name.toLowerCase().trim() !== suggestion.name.toLowerCase().trim()) {
					name = suggestion.name;
				}
			} else {
				stepsError = "I server Gemini sono temporaneamente sovraccarichi. Attendi qualche istante e riprova.";
			}
		} catch (err: any) {
			console.error("AI generation failed:", err);
			const msg = String(err).toLowerCase();
			if (msg.includes("503") || msg.includes("unavailable") || msg.includes("demand") || msg.includes("busy")) {
				stepsError = "I server di Google sono temporaneamente sovraccarichi. Riprova tra qualche istante.";
			} else {
				stepsError = "Errore durante la generazione. Verifica la tua connessione e riprova.";
			}
		} finally {
			generating = false;
		}
	}

	function openModal() {
		showModal = true;
		name = "";
		stepsRaw = "";
		nameError = "";
		stepsError = "";
	}

	function closeModal() {
		showModal = false;
	}

	function handleBackdropClick(e: MouseEvent) {
		if ((e.target as HTMLElement).classList.contains("modal-backdrop")) {
			closeModal();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") closeModal();
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
		closeModal();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<main class="page">
	<header class="exercises-header">
		<div class="header-row">
			<div>
				<h1 class="large-title">Esercizi</h1>
				<p class="page-subtitle">Il tuo programma di allenamento</p>
			</div>
			<button
				class="add-btn"
				on:click={openModal}
				aria-label="Aggiungi esercizio"
			>
				<i class="ti ti-plus"></i>
			</button>
		</div>
	</header>

	<div class="exercises-grid">
		{#each $exerciseProgress as ex (ex.id)}
			<ExerciseCard
				id={ex.id}
				name={ex.name}
				pct={ex.pct}
				completedCount={ex.completedCount}
				total={ex.total}
				current={ex.current}
				next={ex.next}
				isComplete={ex.isComplete}
			/>
		{/each}
	</div>
</main>

{#if showModal}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal-backdrop" on:click={handleBackdropClick}>
		<div
			class="modal ios-card"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<!-- drag handle (mobile feel) -->
			<div class="drag-handle"></div>

			<div class="modal-header">
				<h2 id="modal-title">Nuovo esercizio</h2>
				<button class="close-btn" on:click={closeModal} aria-label="Chiudi">
					<i class="ti ti-x"></i>
				</button>
			</div>

			<div class="modal-body">
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

				<div class="field">
					<div class="field-header-row">
						<span class="ios-section-label">
							Step <span class="label-hint">— uno per riga</span>
						</span>
						<button
							type="button"
							class="ai-gen-btn"
							on:click={generateStepsWithAI}
							disabled={generating || !name.trim()}
							aria-label="Genera step con AI"
						>
							{#if generating}
								<span class="spinner"></span> Generando...
							{:else}
								<i class="ti ti-sparkles"></i> Genera con AI
							{/if}
						</button>
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

			<div class="modal-footer">
				<button class="btn btn--secondary" on:click={closeModal}>Annulla</button
				>
				<button class="btn btn--primary" on:click={handleSubmit}
					>Aggiungi</button
				>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ── Header ── */
	.exercises-header {
		margin-bottom: 1.25rem;
	}

	.header-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	/* ── Add button ── */
	.add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: var(--color-accent-dim);
		color: var(--color-accent);
		font-size: 1.1rem;
		flex-shrink: 0;
		margin-top: 0.3rem;
		padding: 0;
		transition:
			opacity 0.15s ease,
			transform 0.12s ease;
	}

	.add-btn:hover:not(:disabled) {
		opacity: 0.8;
		transform: scale(1.07);
	}

	.add-btn:active {
		transform: scale(0.94);
		opacity: 1;
	}

	/* ── Grid ── */
	.exercises-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
	}

	@media (min-width: 600px) {
		.exercises-grid {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
			gap: 1rem;
		}
	}

	/* ── Backdrop ── */
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		z-index: 100;
		animation: fade-in 0.18s ease;
	}

	@media (min-width: 520px) {
		.modal-backdrop {
			align-items: center;
			padding: 1rem;
		}
	}

	/* ── Sheet / Modal ── */
	.modal {
		width: 100%;
		max-width: 480px;
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		padding: 0; /* override ios-card default padding */
		box-shadow: 0 -2px 24px rgba(0, 0, 0, 0.12);
		animation: slide-up 0.24s cubic-bezier(0.32, 1.2, 0.6, 1);
		overflow: hidden;
	}

	@media (min-width: 520px) {
		.modal {
			border-radius: var(--radius-lg);
			box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
			animation: pop-in 0.22s cubic-bezier(0.32, 1.2, 0.6, 1);
		}
	}

	/* drag handle */
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

	/* ── Modal sections ── */
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.125rem 0;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 50%;
		background: var(--color-track);
		color: var(--color-muted);
		font-size: 0.95rem;
		padding: 0;
		transition: opacity 0.15s;
	}

	.close-btn:hover {
		opacity: 0.7;
	}

	/* ── Form ── */
	.modal-body {
		padding: 1rem 1.125rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

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

	.ai-gen-btn {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		background: var(--color-accent-dim);
		color: var(--color-accent);
		border: none;
		border-radius: var(--radius-card);
		padding: 0.25rem 0.6rem;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition:
			opacity 0.15s ease,
			transform 0.12s ease;
	}

	.ai-gen-btn:hover:not(:disabled) {
		opacity: 0.9;
		transform: scale(1.03);
	}

	.ai-gen-btn:active:not(:disabled) {
		transform: scale(0.97);
	}

	.ai-gen-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
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

	/* reuse global .ios-section-label, just remove its bottom margin here */
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
		font-size: 0.9rem;
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

	/* ── Footer ── */
	.modal-footer {
		display: flex;
		gap: 0.6rem;
		padding: 0 1.125rem 1.25rem;
	}

	.modal-footer .btn {
		flex: 1;
		text-align: center;
		border-radius: var(--radius-card);
	}

	/* ── Animations ── */
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
