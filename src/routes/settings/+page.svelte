<script lang="ts">
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import { exercisesFileTemplate, parseYamlString } from "$lib/utils/parsing";
	import { loadExercises } from "$lib/utils/storage";
	import { onMount } from "svelte";

	const YAML_STORAGE_KEY = "custom_yaml_config";
	const current_exercises = loadExercises() ?? [];

	let loading = $state(false);
	let yamlText = $state("");
	let yamlSaved = $state(true);
	let yamlDirty = $state(false);

	// Load from localStorage on mount
	onMount(() => {
		yamlText = localStorage?.getItem(YAML_STORAGE_KEY) ?? "";
		yamlSaved = !!localStorage?.getItem(YAML_STORAGE_KEY);
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
		localStorage.setItem(YAML_STORAGE_KEY, yamlText);
		yamlSaved = true;
		yamlDirty = false;

		try {
			// Apply the content to the store
			const parsed = await parseYamlString(yamlText);
			exercises.reset(parsed ?? current_exercises);

			alert("Configurazione applicata con successo!");
		} catch {
			yamlSaved = false;
			yamlDirty = true;

			alert("Errore nel parsing del YAML.");
		}
	}

	// --- TEMPLATE ---
	async function copyTemplate() {
		try {
			await navigator.clipboard.writeText(exercisesFileTemplate);
			alert("Template copiato!");
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

			localStorage.setItem(YAML_STORAGE_KEY, fileContent);

			const parsed = await parseYamlString(fileContent);
			exercises.reset(parsed ?? current_exercises);
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
			Scrivi o incolla la tua configurazione. Viene salvata nel browser.
		</p>

		<textarea
			class="yaml-textarea"
			placeholder="Incolla qui il tuo YAML..."
			bind:value={yamlText}
			oninput={handleTextareaChange}
			rows="8"
			spellcheck="false"
		></textarea>

		<div class="btn-row">
			<button class="btn btn-ghost" onclick={copyTemplate}
				>Copia template</button
			>
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
	/* ---- Base ---- */
	.settings-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* ---- Card ---- */
	.card {
		background: var(--color-card);
		border-radius: 10px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* ---- Section header ---- */
	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.section-title {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.section-desc {
		font-size: 0.78rem;
		color: var(--color-text-muted, rgba(255, 255, 255, 0.5));
		margin: 0;
		line-height: 1.4;
	}

	code {
		font-size: 0.75rem;
		background: rgba(255, 255, 255, 0.08);
		padding: 0.1em 0.35em;
		border-radius: 4px;
	}

	/* ---- Badges ---- */
	.badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.15rem 0.5rem;
		border-radius: 99px;
	}

	.badge-saved {
		color: #4ade80;
		background: rgba(74, 222, 128, 0.12);
	}

	.badge-unsaved {
		color: #fbbf24;
		background: rgba(251, 191, 36, 0.12);
	}

	/* ---- Textarea ---- */
	.yaml-textarea {
		width: 100%;
		min-height: 160px;
		background: rgba(0, 0, 0, 0.25);
		color: var(--color-text);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 7px;
		padding: 0.6rem 0.75rem;
		font-family: "Courier New", monospace;
		font-size: 0.78rem;
		line-height: 1.5;
		resize: vertical;
		box-sizing: border-box;
		transition: border-color 0.15s;
	}

	.yaml-textarea:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.25);
	}

	.yaml-textarea::placeholder {
		color: rgba(255, 255, 255, 0.25);
	}

	/* ---- Button row ---- */
	.btn-row {
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

	/* ---- Buttons ---- */
	button {
		border: none;
		border-radius: 7px;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition:
			opacity 0.15s,
			background 0.15s;
		color: white;
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--color-accent, #22c55e);
		color: #000;
	}

	.btn-ghost {
		background: transparent;
		color: rgba(255, 255, 255, 0.5);
		padding-left: 0.25rem;
	}

	.btn-ghost:hover {
		color: white;
	}

	.btn-primary:hover {
		opacity: 0.85;
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
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		box-sizing: border-box;
		padding: 0.65rem 1rem;
		background: rgba(100, 200, 100, 0.08);
		border: 1px dashed rgba(100, 200, 100, 0.3);
		border-radius: 7px;
		font-size: 0.82rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.6);
		transition:
			background 0.15s,
			border-color 0.15s,
			color 0.15s;
	}

	.file-label:hover .file-cta {
		background: rgba(100, 200, 100, 0.14);
		border-color: rgba(100, 200, 100, 0.5);
		color: white;
	}

	/* ---- Danger card ---- */
	.danger-card {
		background: rgba(255, 0, 0, 0.08);
		border: 1px solid rgba(255, 0, 0, 0.15);
	}

	.danger-title {
		color: rgba(255, 100, 100, 0.9);
	}

	.danger-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.btn-danger {
		background: rgba(255, 0, 0, 0.18);
		color: rgba(255, 180, 180, 0.95);
		width: 100%;
	}

	.btn-danger:hover:not(:disabled) {
		background: rgba(255, 0, 0, 0.28);
	}

	@media (min-width: 480px) {
		.card {
			padding: 1.25rem;
		}
	}
</style>
