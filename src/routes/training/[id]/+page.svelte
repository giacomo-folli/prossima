<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { sessions } from "$lib/stores/sessions";
	import posthog from "posthog-js";
	import Icon from "$lib/components/Icon.svelte";

	type SessionExercise = {
		id: string;
		name: string;
		type: "exercise" | "quick-exercise";
		icon?: string;
		step_label?: string;
	};

	// ── Store lookup ────────────────────────────────────────────────────────────
	const sessionId = $derived(page.params.id);

	const session = $derived(
		($sessions ?? []).find((s) => s.id === sessionId) ?? null,
	);

	const exercises = $derived<SessionExercise[]>(
		(session?.exercises ?? []) as SessionExercise[],
	);

	const programExercises = $derived(
		exercises.filter((e) => e.type === "exercise"),
	);
	const quickExercises = $derived(
		exercises.filter((e) => e.type === "quick-exercise"),
	);

	// ── Date helpers ────────────────────────────────────────────────────────────
	const formattedDate = $derived(
		session
			? new Date(session.completed_at).toLocaleDateString("it-IT", {
					weekday: "long",
					day: "numeric",
					month: "long",
					year: "numeric",
				})
			: null,
	);

	const formattedTime = $derived(
		session
			? new Date(session.completed_at).toLocaleTimeString("it-IT", {
					hour: "2-digit",
					minute: "2-digit",
				})
			: null,
	);

	const daysAgo = $derived(() => {
		if (!session) return null;
		const diff = Math.floor(
			(Date.now() - new Date(session.completed_at).getTime()) /
				(1000 * 60 * 60 * 24),
		);
		if (diff === 0) return "oggi";
		if (diff === 1) return "ieri";
		return `${diff} giorni fa`;
	});

	// ── Edit state ──────────────────────────────────────────────────────────────
	let editing = $state(false);
	let saving = $state(false);

	// Local mutable copies — populated when entering edit mode
	let editExercises = $state<SessionExercise[]>([]);
	let editNote = $state("");
	let editDate = $state(""); // ISO date string for <input type="date">
	let editTime = $state(""); // HH:MM for <input type="time">

	// The note is stored on the session object (optional field we add)
	const existingNote = $derived((session as any)?.note ?? "");

	function enterEdit() {
		if (!session) return;
		editExercises = [...exercises];
		editNote = existingNote;
		// Split completed_at into local date + time
		const d = new Date(session.completed_at);
		editDate = d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
		editTime = d.toLocaleTimeString("it-IT", {
			hour: "2-digit",
			minute: "2-digit",
		});
		editing = true;
	}

	function cancelEdit() {
		editing = false;
	}

	function removeExercise(id: string) {
		editExercises = editExercises.filter((e) => e.id !== id);
	}

	async function saveEdit() {
		if (!session || !session.id) return;
		saving = true;

		const [h, m] = editTime.split(":").map(Number);
		const newDate = new Date(editDate);
		newDate.setHours(h, m, 0, 0);

		await sessions.updateSession(session.id, {
			exercises: editExercises,
			completed_at: newDate.toISOString(),
			notes: editNote.trim() || undefined,
			liked: false,
		});

		posthog.capture("session_edited", {
			session_id: session.id,
			exercise_count: editExercises.length,
			has_note: editNote.trim().length > 0,
		});

		saving = false;
		editing = false;
	}

	// Derived counters for edit preview
	const editProgram = $derived(
		editExercises.filter((e) => e.type === "exercise"),
	);
	const editQuick = $derived(
		editExercises.filter((e) => e.type === "quick-exercise"),
	);
</script>

<div class="page">
	<!-- ── Nav ──────────────────────────────────────────────────────────── -->
	<div class="top-bar">
		{#if editing}
			<button
				class="nav-text-btn cancel-btn"
				onclick={cancelEdit}
				disabled={saving}
			>
				Annulla
			</button>
			<span class="top-bar-title">Modifica</span>
			<button
				class="nav-text-btn save-btn"
				onclick={saveEdit}
				disabled={saving}
			>
				{saving ? "…" : "Salva"}
			</button>
		{:else}
			<a href={resolve("/home")} class="nav-back">
				<Icon name="chevron-left" size={24} />
				Home
			</a>
			{#if session}
				<button
					class="edit-btn"
					onclick={enterEdit}
					aria-label="Modifica sessione"
				>
					<Icon name="pencil" size={16} />
					Modifica
				</button>
			{/if}
		{/if}
	</div>

	{#if !session}
		<div class="empty-state ios-card">
			<Icon name="mood-puzzled" size={48} class="empty-icon" />
			<p>Sessione non trovata.</p>
		</div>
	{:else if editing}
		<!-- ══════════════════════════════════════════════════════════════════
		     EDIT MODE
		     ══════════════════════════════════════════════════════════════════ -->

		<!-- Date / time editors -->
		<div class="edit-section ios-card">
			<p class="edit-section-title">
				<Icon name="calendar" size={16} />
				Data e ora
			</p>
			<div class="datetime-row">
				<div class="datetime-field">
					<label for="edit-date">Data</label>
					<input
						id="edit-date"
						type="date"
						bind:value={editDate}
						class="edit-input"
					/>
				</div>
				<div class="datetime-field">
					<label for="edit-time">Ora</label>
					<input
						id="edit-time"
						type="time"
						bind:value={editTime}
						class="edit-input"
					/>
				</div>
			</div>
		</div>

		<!-- Note editor -->
		<div class="edit-section ios-card">
			<p class="edit-section-title">
				<Icon name="notes" size={16} />
				Note
			</p>
			<textarea
				class="note-textarea"
				placeholder="Come è andata? Aggiungi una nota…"
				bind:value={editNote}
				rows="3"
			></textarea>
		</div>

		<!-- Program exercises -->
		{#if editProgram.length > 0}
			<div class="edit-section ios-card">
				<p class="edit-section-title">
					<Icon name="dumbbell" size={16} />
					Programma
					<span class="edit-section-count">{editProgram.length}</span>
				</p>
				<ul class="edit-list">
					{#each editProgram as ex (ex.id)}
						<li class="edit-item">
							<div class="ex-bullet">
								<Icon name="dumbbell" size={14} />
							</div>
							<div class="ex-body">
								<span class="ex-name-plain">{ex.name}</span>
								{#if ex.step_label}
									<span class="ex-step">{ex.step_label}</span>
								{/if}
							</div>
							<button
								class="remove-btn"
								onclick={() => removeExercise(ex.id)}
								aria-label="Rimuovi {ex.name}"
							>
								<Icon name="circle-minus" size={20} />
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Quick exercises -->
		{#if editQuick.length > 0}
			<div class="edit-section ios-card">
				<p class="edit-section-title">
					<Icon name="bolt" size={16} />
					Esercizi rapidi
					<span class="edit-section-count">{editQuick.length}</span>
				</p>
				<ul class="edit-list">
					{#each editQuick as ex (ex.id)}
						<li class="edit-item">
							<span class="quick-icon-sm" aria-hidden="true">
								{ex.icon ?? "⚡"}
							</span>
							<span class="ex-name-plain">{ex.name}</span>
							<button
								class="remove-btn"
								onclick={() => removeExercise(ex.id)}
								aria-label="Rimuovi {ex.name}"
							>
								<Icon name="circle-minus" size={20} />
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if editExercises.length === 0}
			<p class="edit-empty">Nessun esercizio rimasto. Salva per aggiornare.</p>
		{/if}

		<!-- Save / cancel row (also at bottom for long lists) -->
		<div class="edit-actions">
			<button class="btn btn--ghost" onclick={cancelEdit} disabled={saving}>
				Annulla
			</button>
			<button class="btn btn--primary" onclick={saveEdit} disabled={saving}>
				{saving ? "Salvataggio…" : "Salva modifiche"}
			</button>
		</div>
	{:else}
		<!-- ══════════════════════════════════════════════════════════════════
		     VIEW MODE
		     ══════════════════════════════════════════════════════════════════ -->

		<!-- Header -->
		<header class="session-header">
			<div class="header-badge">
				<Icon name="dumbbell" size={24} />
			</div>
			<div class="header-text">
				<h1 class="session-title">Sessione</h1>
				<p class="session-meta">
					<span class="capitalize">{formattedDate}</span>
					<span class="dot">·</span>
					<span>{formattedTime}</span>
					<span class="dot">·</span>
					<span class="muted">{daysAgo()}</span>
				</p>
			</div>
		</header>

		<!-- Note (read-only) -->
		{#if existingNote}
			<div class="note-card ios-card">
				<Icon name="notes" size={16} class="note-icon" />
				<p class="note-text">{existingNote}</p>
			</div>
		{/if}

		<!-- Summary cards -->
		<div class="summary-row">
			<div class="summary-card ios-card">
				<Icon name="list-check" size={20} class="card-icon" />
				<span class="summary-value">{programExercises.length}</span>
				<span class="summary-label">Esercizi</span>
			</div>

			<div class="summary-card ios-card">
				<Icon name="bolt" size={20} class="card-icon" />
				<span class="summary-value">{quickExercises.length}</span>
				<span class="summary-label">Rapidi</span>
			</div>

			<div class="summary-card ios-card">
				<Icon name="stack" size={20} class="card-icon" />
				<span class="summary-value">{exercises.length}</span>
				<span class="summary-label">Totale</span>
			</div>
		</div>

		<!-- Program list -->
		{#if programExercises.length > 0}
			<section class="section">
				<p class="section-label">Programma</p>
				<ul class="ex-list ios-card">
					{#each programExercises as ex, i (ex.id ?? i)}
						<li class="ex-item">
							<div class="ex-bullet">
								<Icon name="dumbbell" size={16} />
							</div>
							<div class="ex-body">
								<a
									href={resolve("/exercises/[id]", { id: ex.id })}
									class="ex-name"
								>
									{ex.name}
								</a>
								{#if ex.step_label}
									<span class="ex-step">{ex.step_label}</span>
								{/if}
							</div>
							<Icon name="chevron-right" size={16} class="ex-chevron" />
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Quick exercises -->
		{#if quickExercises.length > 0}
			<section class="section">
				<p class="section-label">Esercizi rapidi</p>
				<div class="quick-grid">
					{#each quickExercises as ex, i (ex.id ?? i)}
						<div class="quick-chip ios-card">
							{#if ex.icon}
								<span class="quick-icon" aria-hidden="true">{ex.icon}</span>
							{:else}
								<Icon name="bolt" size={16} class="quick-icon-fallback" />
							{/if}
							<span class="quick-name">{ex.name}</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<button
			class="delete-btn"
			onclick={async () => {
				if (!confirm("Eliminare questa sessione?")) return;
				const sessionId = session!.id!;
				posthog.capture("session_deleted", { session_id: sessionId });
				await sessions.deleteSession(sessionId);
				goto(resolve("/home"));
			}}
		>
			<Icon name="trash" size={18} />
			Elimina sessione
		</button>
	{/if}
</div>

<style>
	.page {
		max-width: 520px;
		margin: 0 auto;
		padding-bottom: 3rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* ── Top bar ── */
	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 2rem;
	}

	.top-bar-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.nav-text-btn {
		background: none;
		border: none;
		padding: 0.25rem 0;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.cancel-btn {
		color: var(--color-muted);
	}

	.save-btn {
		color: var(--color-accent);
	}

	.edit-btn {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		background: none;
		border: none;
		padding: 0.3rem 0;
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-accent);
	}

	.edit-btn i {
		font-size: 15px;
	}

	/* ── Header (view) ── */
	.session-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.25rem;
	}

	.header-badge {
		width: 52px;
		height: 52px;
		flex-shrink: 0;
		border-radius: 14px;
		background: var(--color-accent-dim);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header-badge i {
		font-size: 22px;
		color: var(--color-accent);
	}

	.header-text {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.session-title {
		margin: 0;
		font-size: 1.6rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.1;
		color: var(--color-text);
	}

	.session-meta {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-muted);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
	}

	.dot {
		opacity: 0.4;
	}
	.capitalize {
		text-transform: capitalize;
	}
	.muted {
		opacity: 0.7;
	}

	/* ── Note card (view) ── */
	.note-card {
		display: flex;
		gap: 0.75rem;
		padding: 1rem 1.1rem;
		align-items: flex-start;
	}

	.note-icon {
		font-size: 1rem;
		color: var(--color-accent);
		margin-top: 0.1rem;
		flex-shrink: 0;
	}

	.note-text {
		margin: 0;
		font-size: 0.9rem;
		color: var(--color-text);
		line-height: 1.5;
		white-space: pre-wrap;
	}

	/* ── Summary row ── */
	.summary-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	.summary-card {
		padding: 1.1rem 0.75rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	.card-icon {
		font-size: 1.25rem;
		color: var(--color-accent);
		margin-bottom: 0.2rem;
	}

	.summary-value {
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1;
		color: var(--color-text);
	}

	.summary-label {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-muted);
	}

	/* ── Sections (view) ── */
	.section {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.section-label {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
	}

	/* ── Exercise list (view) ── */
	.ex-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	.ex-item {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.9rem 1rem 0.9rem 1.1rem;
		border-bottom: 1px solid var(--color-border, #2c2c2e);
	}

	.ex-item:last-child {
		border-bottom: none;
	}

	.ex-bullet {
		width: 30px;
		height: 30px;
		flex-shrink: 0;
		border-radius: 8px;
		background: var(--color-accent-dim);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ex-bullet i {
		font-size: 14px;
		color: var(--color-accent);
	}

	.ex-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.ex-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text);
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ex-name:hover {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.ex-name-plain {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ex-step {
		font-size: 0.8rem;
		color: var(--color-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ex-chevron {
		font-size: 14px;
		color: var(--color-muted);
		opacity: 0.5;
		flex-shrink: 0;
	}

	/* ── Quick grid (view) ── */
	.quick-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.6rem;
	}

	.quick-chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.9rem 0.5rem;
		border-radius: 12px;
		text-align: center;
	}

	.quick-icon {
		font-size: 1.4rem;
		line-height: 1;
	}
	.quick-icon-fallback {
		font-size: 1.1rem;
		color: var(--color-accent);
	}

	.quick-name {
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--color-text);
		line-height: 1.2;
	}

	/* ══════════════════════════════════════════════════════════════════
	   EDIT MODE
	   ══════════════════════════════════════════════════════════════════ */

	.edit-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.1rem 1.1rem 1.25rem;
	}

	.edit-section-title {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.edit-section-title i {
		font-size: 13px;
	}

	.edit-section-count {
		margin-left: auto;
		font-size: 0.72rem;
		font-weight: 500;
		color: var(--color-muted);
		text-transform: none;
		letter-spacing: 0;
	}

	/* Date / time row */
	.datetime-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.datetime-field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.datetime-field label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--color-muted);
	}

	.edit-input {
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text);
		background: var(--color-track, #2c2c2e);
		border: 1.5px solid var(--color-border, #3a3a3c);
		border-radius: 10px;
		padding: 0.6rem 0.75rem;
		width: 100%;
		box-sizing: border-box;
		outline: none;
		-webkit-appearance: none;
		appearance: none;
		transition: border-color 0.15s;
		color-scheme: dark;
	}

	.edit-input:focus {
		border-color: var(--color-accent);
	}

	/* Note textarea */
	.note-textarea {
		font-family: var(--font-sans);
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--color-text);
		background: var(--color-track, #2c2c2e);
		border: 1.5px solid var(--color-border, #3a3a3c);
		border-radius: 10px;
		padding: 0.7rem 0.85rem;
		width: 100%;
		box-sizing: border-box;
		outline: none;
		resize: vertical;
		min-height: 80px;
		transition: border-color 0.15s;
	}

	.note-textarea:focus {
		border-color: var(--color-accent);
	}

	.note-textarea::placeholder {
		color: var(--color-muted);
		font-weight: 400;
	}

	/* Edit exercise list */
	.edit-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.edit-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border, #2c2c2e);
	}

	.edit-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.edit-item:first-child {
		padding-top: 0;
	}

	.quick-icon-sm {
		font-size: 1.25rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.remove-btn {
		background: none;
		border: none;
		padding: 0.2rem;
		cursor: pointer;
		color: var(--color-danger, #ff453a);
		display: flex;
		align-items: center;
		border-radius: 6px;
		flex-shrink: 0;
		transition: opacity 0.15s;
	}

	.remove-btn i {
		font-size: 20px;
	}

	.remove-btn:hover {
		opacity: 0.7;
	}

	.edit-empty {
		margin: 0;
		text-align: center;
		font-size: 0.85rem;
		color: var(--color-muted);
		padding: 1rem 0;
	}

	/* Bottom action row */
	.edit-actions {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 0.75rem;
		margin-top: 0.25rem;
	}

	/* ── Empty state ── */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 3rem 1.5rem;
		text-align: center;
		color: var(--color-muted);
	}

	.empty-icon {
		font-size: 2.5rem;
		opacity: 0.5;
	}

	.delete-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: none;
		border: 1.5px solid var(--color-danger, #ff453a);
		color: var(--color-danger, #ff453a);
		border-radius: 12px;
		padding: 0.8rem 1rem;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		margin-top: 0.5rem;
		transition: opacity 0.15s;
	}

	.delete-btn:hover {
		opacity: 0.7;
	}

	/* ── Desktop ── */
	@media (min-width: 600px) {
		.quick-grid {
			grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
		}
	}
</style>
