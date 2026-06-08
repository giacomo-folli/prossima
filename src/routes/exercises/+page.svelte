<script lang="ts">
	import ExerciseCard from "$lib/components/ExerciseCard.svelte";
	import { exerciseProgress, exercises } from "$lib/stores/exercises";
	import { suggestExercise } from "$lib/groq";
	import Icon from "$lib/components/Icon.svelte";
	import { slide } from "svelte/transition";

	let showModal = false;
	let name = "";
	let stepsRaw = "";
	let nameError = "";
	let stepsError = "";
	let generating = false;

	// Personalized setup state
	let creationMode: "manual" | "ai" = "manual";
	let goal = "";
	let currentLevel = "";

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

	function openModal() {
		showModal = true;
		name = "";
		stepsRaw = "";
		goal = "";
		currentLevel = "";
		creationMode = "manual";
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
<svelte:body class:no-scroll={showModal} />

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
				<Icon name="plus" size={24} />
			</button>
		</div>
	</header>

	{#if $exerciseProgress.length === 0}
		<div class="empty-state">
			<Icon name="mood-puzzled" size={48} class="empty-icon" />
			<h3 class="empty-title">Nessun esercizio</h3>
			<p class="empty-desc">
				Crea il tuo primo esercizio per iniziare ad allenarti!
			</p>
			<button class="btn btn-primary empty-cta" on:click={openModal}
				>Aggiungi esercizio</button
			>
		</div>
	{:else}
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
	{/if}
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
					<Icon name="x" size={18} />
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
						{#if creationMode === "manual"}
							<button
								type="button"
								class="ai-gen-btn"
								on:click={() => (creationMode = "ai")}
								aria-label="Usa Generatore AI"
							>
								<Icon name="sparkles" size={12} /> Genera con AI
							</button>
						{/if}
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
		padding: 0 0.5rem;
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	/* ── Add button (FAB) ── */
	.add-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--color-accent);
		color: #ffffff;
		box-shadow: 0 4px 12px rgba(45, 106, 79, 0.35);
		flex-shrink: 0;
		padding: 0;
		transition:
			opacity 0.15s ease,
			transform 0.12s ease;
	}

	.add-btn:active {
		transform: scale(0.94);
		opacity: 0.9;
	}

	/* ── Grid ── */
	.exercises-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 12px;
		padding: 0;
	}

	@media (min-width: 600px) {
		.exercises-grid {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
			gap: 12px;
		}
	}

	/* ── Empty State ── */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 3rem 1.5rem;
		color: var(--color-muted);
	}

	:global(.empty-icon) {
		color: var(--color-text-disabled);
		margin-bottom: 1rem;
	}

	.empty-title {
		margin: 0 0 0.5rem;
		font-size: 18px;
		font-weight: 700;
		color: var(--color-text);
	}

	.empty-desc {
		margin: 0 0 1.5rem;
		font-size: 14px;
		max-width: 260px;
		line-height: 1.5;
	}

	.empty-cta {
		padding: 0.75rem 1.5rem;
		font-size: 15px;
		border-radius: 12px;
	}

	/* ── Backdrop ── */
	.modal-backdrop {
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
		font-size: 16px;
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

	/* ── Segmented Control ── */
	.segmented-control {
		display: flex;
		background: var(--color-track);
		border-radius: var(--radius-card);
		padding: 3px;
		margin-bottom: 0.25rem;
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

	/* ── AI Fields & Premium Button ── */
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
