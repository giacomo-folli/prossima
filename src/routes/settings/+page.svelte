<script lang="ts">
	import { exercises } from "$lib/stores/exercises";
	import { quickExercises } from "$lib/stores/quickExercises";
	import { sessions } from "$lib/stores/sessions";
	import { StorageKeys } from "$lib/utils/enums";
	import { parseYamlString } from "$lib/utils/parsing";
	import { loadExercises } from "$lib/utils/storage";
	import { onMount } from "svelte";

	const current_exercises = loadExercises() ?? [];

	let loading = $state(false);
	let yamlText = $state("");
	let yamlSaved = $state(true);
	let yamlDirty = $state(false);

	// Load from localStorage on mount
	onMount(() => {
		yamlText = localStorage?.getItem(StorageKeys.CONFIG_FILE) ?? "";
		yamlSaved = !!localStorage?.getItem(StorageKeys.CONFIG_FILE);
	});

	function handleTextareaChange() {
		yamlSaved = false;
		yamlDirty = true;
	}

	async function handleLoadFromTextarea() {
		if (!yamlText.trim()) {
			alert("Il campo YAML è vuoto.");
			return;
		}

		// Save to storage the textarea content
		localStorage.setItem(StorageKeys.CONFIG_FILE, yamlText);
		yamlSaved = true;
		yamlDirty = false;

		try {
			// Apply the content to the store
			const {
				exercises: parsedExercises,
				quickExercises: parsedQuickExercises,
			} = parseYamlString(yamlText);

			exercises.set(parsedExercises ?? current_exercises);
			quickExercises.set(parsedQuickExercises ?? []);

			alert("Configurazione applicata con successo!");
		} catch {
			yamlSaved = false;
			yamlDirty = true;

			alert("Errore nel parsing del YAML.");
		}
	}

	// --- TEMPLATE ---
	async function copyYaml() {
		try {
			await navigator.clipboard.writeText(yamlText);
			alert("Testo copiato!");
		} catch {
			alert("Errore nella copia.");
		}
	}

	// --- FILE UPLOAD ---
	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		try {
			const fileContent = await file.text();

			localStorage.setItem(StorageKeys.CONFIG_FILE, fileContent);

			const {
				exercises: parsedExercises,
				quickExercises: parsedQuickExercises,
			} = parseYamlString(fileContent);
			exercises.set(parsedExercises ?? current_exercises);
			quickExercises.set(parsedQuickExercises ?? []);

			yamlText = fileContent;
			yamlDirty = true;
			yamlSaved = false;
			alert("File caricato. Salva nella sezione YAML se vuoi conservarlo.");
		} catch {
			alert("Errore nella lettura del file YAML.");
		}
	}

	// --- DANGER ZONE ---
	async function handleResetProgress() {
		if (
			confirm("Resettare i progressi correnti? Lo storico rimarrà intatto.")
		) {
			loading = true;
			exercises.clearProgress();
			loading = false;
		}
	}

	async function handleClearTrainingHistory() {
		if (
			confirm(
				"ATTENZIONE: Questo cancellerà definitivamente tutto lo storico allenamenti.",
			)
		) {
			loading = true;
			sessions.clearSessions();
			loading = false;
		}
	}
</script>

<div class="settings-container">
	<!-- SEZIONE 1: YAML Editor -->
	<section class="card yaml-section">
		<div class="section-header">
			<span class="section-title">Configurazione YAML</span>
			{#if yamlSaved}
				<span class="badge badge-saved">● Salvato</span>
			{:else if yamlDirty}
				<span class="badge badge-unsaved">● Non salvato</span>
			{/if}
		</div>
		<p class="section-desc">
			Scrivi o incolla la tua configurazione.
		</p>

		<div class="textarea-wrapper">
			<textarea
				class="yaml-textarea"
				placeholder="Incolla qui il tuo YAML..."
				bind:value={yamlText}
				oninput={handleTextareaChange}
				rows="8"
				spellcheck="false"
			></textarea>

			<button class="btn btn-copy" onclick={copyYaml} aria-label="Copia"
				>Copia</button
			>
		</div>

		<div class="btn-row">
			<div class="btn-group-right">
				<button class="btn btn-primary" onclick={handleLoadFromTextarea}
					>Applica</button
				>
			</div>
		</div>
	</section>

	<!-- SEZIONE 2: File upload -->
	<section class="card">
		<div class="section-header">
			<span class="section-title">Carica da file</span>
		</div>
		<p class="section-desc">
			Carica un file <code>.yaml</code> dal dispositivo. Il contenuto verrà mostrato
			nell'editor sopra.
		</p>
		<label class="file-label">
			<input type="file" accept=".yaml" onchange={handleFileUpload} />
			<span class="file-cta">Scegli file .yaml</span>
		</label>
	</section>

	<!-- SEZIONE 3: Danger zone -->
	<section class="card danger-card">
		<div class="section-header">
			<span class="section-title danger-title">Danger zone</span>
		</div>
		<div class="danger-buttons">
			<button
				class="btn btn-danger"
				onclick={handleResetProgress}
				disabled={loading}
			>
				Resetta i progressi
			</button>
			<button
				class="btn btn-danger"
				onclick={handleClearTrainingHistory}
				disabled={loading}
			>
				Elimina lo storico allenamenti
			</button>
		</div>
	</section>
</div>

<style>
	/* ---- Design tokens (light defaults) ---- */
	:root {
		/* Badge: saved (green) */
		--color-badge-saved-text: #16a34a;
		--color-badge-saved-bg: rgba(22, 163, 74, 0.12);

		/* Badge: unsaved (amber) */
		--color-badge-unsaved-text: #d97706;
		--color-badge-unsaved-bg: rgba(217, 119, 6, 0.12);

		/* Textarea */
		--color-textarea-bg: rgba(0, 0, 0, 0.06);
		--color-textarea-border: rgba(0, 0, 0, 0.1);
		--color-textarea-border-focus: rgba(0, 0, 0, 0.3);
		--color-textarea-placeholder: rgba(0, 0, 0, 0.25);

		/* Code inline */
		--color-code-bg: rgba(0, 0, 0, 0.07);

		/* Section description */
		--color-text-muted: rgba(0, 0, 0, 0.5);

		/* File upload CTA */
		--color-file-cta-bg: rgba(22, 163, 74, 0.07);
		--color-file-cta-border: rgba(22, 163, 74, 0.3);
		--color-file-cta-text: rgba(0, 0, 0, 0.8);
		--color-file-cta-bg-hover: rgba(22, 163, 74, 0.13);
		--color-file-cta-border-hover: rgba(22, 163, 74, 0.5);
		--color-file-cta-text-hover: rgba(0, 0, 0, 0.85);

		/* Danger zone */
		--color-danger-card-bg: rgba(220, 38, 38, 0.07);
		--color-danger-card-border: rgba(220, 38, 38, 0.15);
		--color-danger-title: rgba(185, 28, 28, 0.9);
		--color-danger-btn-bg: rgba(220, 38, 38, 0.15);
		--color-danger-btn-text: rgba(185, 28, 28, 0.95);
		--color-danger-btn-bg-hover: rgba(220, 38, 38, 0.26);

		/* Copy button */
		--color-btn-copy-bg: rgba(0, 0, 0, 0.05);
		--color-btn-copy-border: rgba(0, 0, 0, 0.1);
		--color-btn-copy-text: rgba(0, 0, 0, 0.4);
		--color-btn-copy-bg-hover: rgba(0, 0, 0, 0.1);
		--color-btn-copy-text-hover: rgba(0, 0, 0, 0.85);
	}

	/* ---- Dark scheme overrides ---- */
	@media (prefers-color-scheme: dark) {
		:root {
			/* Badge: saved */
			--color-badge-saved-text: #4ade80;
			--color-badge-saved-bg: rgba(74, 222, 128, 0.12);

			/* Badge: unsaved */
			--color-badge-unsaved-text: #fbbf24;
			--color-badge-unsaved-bg: rgba(251, 191, 36, 0.12);

			/* Textarea */
			--color-textarea-bg: rgba(0, 0, 0, 0.25);
			--color-textarea-border: rgba(255, 255, 255, 0.08);
			--color-textarea-border-focus: rgba(255, 255, 255, 0.25);
			--color-textarea-placeholder: rgba(255, 255, 255, 0.25);

			/* Code inline */
			--color-code-bg: rgba(255, 255, 255, 0.08);

			/* Section description */
			--color-text-muted: rgba(255, 255, 255, 0.5);

			/* File upload CTA */
			--color-file-cta-bg: rgba(100, 200, 100, 0.08);
			--color-file-cta-border: rgba(100, 200, 100, 0.3);
			--color-file-cta-text: rgba(255, 255, 255, 0.6);
			--color-file-cta-bg-hover: rgba(100, 200, 100, 0.14);
			--color-file-cta-border-hover: rgba(100, 200, 100, 0.5);
			--color-file-cta-text-hover: white;

			/* Danger zone */
			--color-danger-card-bg: rgba(255, 0, 0, 0.08);
			--color-danger-card-border: rgba(255, 0, 0, 0.15);
			--color-danger-title: rgba(255, 100, 100, 0.9);
			--color-danger-btn-bg: rgba(255, 0, 0, 0.18);
			--color-danger-btn-text: rgba(255, 180, 180, 0.95);
			--color-danger-btn-bg-hover: rgba(255, 0, 0, 0.28);

			/* Copy button */
			--color-btn-copy-bg: rgba(255, 255, 255, 0.07);
			--color-btn-copy-border: rgba(255, 255, 255, 0.12);
			--color-btn-copy-text: rgba(255, 255, 255, 0.5);
			--color-btn-copy-bg-hover: rgba(255, 255, 255, 0.14);
			--color-btn-copy-text-hover: white;
		}
	}

	.settings-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	code {
		font-size: 0.75rem;
		background: var(--color-code-bg);
		padding: 0.1em 0.35em;
		border-radius: 4px;
	}

	/* ---- Textarea ---- */
	.yaml-textarea {
		width: 100%;
		min-height: 400px;
		background: var(--color-textarea-bg);
		color: var(--color-text);
		border: 1px solid var(--color-textarea-border);
		border-radius: 0.85rem;
		padding: 0.75rem 2.8rem 0.75rem 0.75rem;
		font-family: "Courier New", monospace;
		font-size: 16;
		line-height: 1.5;
		resize: vertical;
		box-sizing: border-box;
		transition: border-color 0.15s ease;
	}

	.yaml-textarea:focus {
		outline: none;
		border-color: var(--color-textarea-border-focus);
	}

	.yaml-textarea::placeholder {
		color: var(--color-textarea-placeholder);
	}

	/* ---- Button row ---- */
	.btn-row {
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.btn-group-right {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		flex-wrap: wrap;
	}

	@media (min-width: 480px) {
		.btn-row {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.textarea-wrapper {
		margin-top: 0.5rem;
		position: relative;
		width: 100%;
	}

	/* ---- File upload ---- */
	.file-label {
		display: block;
		cursor: pointer;
	}

	.file-label input[type="file"] {
		display: none;
	}

	.file-cta {
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		box-sizing: border-box;
		padding: 0.65rem 1rem;
		background: var(--color-file-cta-bg);
		border: 1px dashed var(--color-file-cta-border);
		border-radius: 7px;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--color-file-cta-text);
		transition:
			background 0.15s,
			border-color 0.15s,
			color 0.15s;
	}

	.file-label:hover .file-cta {
		background: var(--color-file-cta-bg-hover);
		border-color: var(--color-file-cta-border-hover);
		color: var(--color-file-cta-text-hover);
	}

	/* ---- Danger card ---- */
	.danger-card {
		background: var(--color-danger-card-bg);
		border: 1px solid var(--color-danger-card-border);
	}

	.danger-title {
		color: var(--color-danger-title);
	}

	.danger-buttons {
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.btn-danger {
		background: var(--color-danger-btn-bg);
		color: var(--color-danger-btn-text);
		width: 100%;
	}

	.btn-danger:hover:not(:disabled) {
		background: var(--color-danger-btn-bg-hover);
	}

	@media (min-width: 480px) {
		.card {
			padding: 1.25rem;
		}
	}

	.btn-copy {
		position: absolute;
		top: 6px;
		right: 8px;
		background: var(--color-btn-copy-bg);
		border: 1px solid var(--color-btn-copy-border) !important;
		border-radius: 5px;
		padding: 0.2rem 0.5rem;
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--color-btn-copy-text);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.btn-copy:hover {
		background: var(--color-btn-copy-bg-hover);
		color: var(--color-btn-copy-text-hover);
	}
</style>
