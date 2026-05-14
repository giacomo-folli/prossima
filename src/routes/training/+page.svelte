<script lang="ts">
	import { resolve } from "$app/paths";
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import type { SessionExercise } from "$lib/types";

	let program = $derived(
		$exercises
			.filter((ex) => ex.currentStepIndex < ex.steps.length)
			.map((ex) => ({
				exerciseId: ex.id,
				exerciseName: ex.name,
				stepLabel: ex.steps[ex.currentStepIndex]?.label ?? "—",
				checked: true,
			})),
	);

	let pastSessions = $derived($sessions.map((s) => ({ ...s, hidden: true })));

	let logging = $state(false);

	function handleDeleteSession(e: Event, id: string) {
		e.stopPropagation();
		if (confirm("Questa azione eliminerà la sessione.\n\nContinuare?")) {
			sessions.deleteSession(id);
		}
	}

	function logSession() {
		if (program.length === 0) return;
		const snapshot: SessionExercise[] = program
			.filter((ex) => ex.checked)
			.map((p) => {
				const { checked, ...rest } = p;
				return rest;
			});

		logging = true;
		sessions.logSession(snapshot);
		setTimeout(() => (logging = false), 1800);
	}

	function formatDate(iso: string) {
		const d = new Date(iso);
		return d.toLocaleDateString("it-IT", {
			weekday: "short",
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	}

	function formatTime(iso: string) {
		const d = new Date(iso);
		return d.toLocaleTimeString("it-IT", {
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function toggleSessionInfo(id: string) {
		const toggled = pastSessions.find((s) => s.id == id);
		if (!toggled) return;
		console.log("FOUND");

		pastSessions = pastSessions.map((s) => {
			if (s.id == id) return { ...toggled, hidden: !toggled.hidden };
			else return s;
		});
	}
</script>

<div class="training-layout">
	<!-- LEFT: current program -->
	<section class="col col-program">
		<header class="col-header">
			<div>
				<h2>Programma attuale</h2>
				<p class="col-sub">{program.length} esercizi</p>
			</div>
			<button
				class="btn-log"
				class:logged={logging}
				onclick={logSession}
				disabled={program.length === 0 || logging}
			>
				{logging ? "✓ Salvato" : "Registra sessione"}
			</button>
		</header>

		<ol class="program-list">
			{#each program as item (item.exerciseId)}
				<li class="program-item">
					<input
						type="checkbox"
						id={item.exerciseId}
						bind:checked={item.checked}
					/>
					<a
						href={resolve(`/exercises/${item.exerciseId}`)}
						class="program-link"
					>
						<span class="ex-name">{item.exerciseName}</span>
						<span class="ex-step">{item.stepLabel}</span>
					</a>
				</li>
			{/each}
		</ol>
	</section>

	<!-- RIGHT: history -->
	<section class="col col-history">
		<header class="col-header">
			<div>
				<h2>Sessioni precedenti</h2>
				<p class="col-sub">{$sessions.length} sessioni</p>
			</div>
		</header>

		{#if $sessions.length === 0}
			<p class="empty">Nessuna sessione registrata.</p>
		{:else}
			<ul class="session-list">
				{#each pastSessions as session (session.id)}
					<li class="session-card">
						<div
							role="presentation"
							class="session-header"
							onclick={() => toggleSessionInfo(session.id)}
						>
							<div class="session-meta">
								<span class="session-date"
									>{formatDate(session.completedAt)}</span
								>
								<span class="session-time"
									>{formatTime(session.completedAt)}</span
								>
							</div>

							<button
								class="btn-delete"
								onclick={(e) => handleDeleteSession(e, session.id)}
								aria-label="Elimina sessione">×</button
							>
						</div>
						<div class="session-exercises" class:hidden={session.hidden}>
							{#each session.exercises as ex}
								<li class="session-ex">
									<span class="sex-name">{ex.exerciseName}</span>
									<span class="sex-step">{ex.stepLabel}</span>
								</li>
							{/each}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.training-layout {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
		align-items: start;
	}

	.col-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.25rem;
		gap: 1rem;
		flex-wrap: wrap;
	}

	h2 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
	}

	.col-sub {
		margin: 0.2rem 0 0;
		font-size: 0.78rem;
		color: var(--color-muted);
	}

	/* Program list */
	.program-list {
		list-style: none;
		margin: 0;
		padding: 0;
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		overflow: hidden;
	}

	.program-item {
		border-bottom: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 0 0 1rem;
	}

	.program-item:last-child {
		border-bottom: none;
	}

	.program-link {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
		padding: 0.8rem 1.2rem;
		text-decoration: none;
		color: inherit;
		transition: background 0.12s;
	}

	.ex-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.ex-step {
		font-size: 0.8rem;
		color: var(--color-muted);
		text-align: right;
		flex-shrink: 0;
	}

	/* Log button */
	.btn-log {
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 7px;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition:
			opacity 0.15s,
			background 0.25s;
		flex-shrink: 0;
	}

	.btn-log:hover:not(:disabled) {
		opacity: 0.85;
	}

	.btn-log:disabled {
		cursor: default;
	}

	.btn-log.logged {
		background: var(--color-muted);
	}

	/* History */
	.empty {
		font-size: 0.85rem;
		color: var(--color-muted);
		margin: 0;
	}

	.session-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.session-card {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 1rem 1.2rem;
		opacity: 0.7;
	}

	.session-card:hover {
		opacity: 1;
	}

	.session-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.session-meta {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}

	.session-date {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--color-text);
		text-transform: capitalize;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.session-time {
		font-size: 0.72rem;
		color: var(--color-muted);
	}

	.btn-delete {
		background: none;
		border: none;
		color: var(--color-muted);
		font-size: 1.1rem;
		line-height: 1;
		cursor: pointer;
		padding: 0.2rem 0.3rem;
		border-radius: 4px;
		transition:
			color 0.1s,
			background 0.1s;
		flex-shrink: 0;
	}

	.btn-delete:hover {
		color: var(--color-text);
		background: var(--color-track);
	}

	.confirm-row {
		display: flex;
		gap: 0.4rem;
		flex-shrink: 0;
	}

	.btn-confirm-del {
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 5px;
		padding: 0.2rem 0.55rem;
		font-size: 0.72rem;
		color: #c0392b;
		cursor: pointer;
		transition: background 0.1s;
	}

	.btn-confirm-del:hover {
		background: #fdf0ef;
	}

	.btn-cancel {
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 5px;
		padding: 0.2rem 0.55rem;
		font-size: 0.72rem;
		color: var(--color-muted);
		cursor: pointer;
		transition: background 0.1s;
	}

	.btn-cancel:hover {
		background: var(--color-track);
	}

	.session-exercises {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.session-ex {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.35rem 0;
		border-top: 1px solid var(--color-border);
		font-size: 0.8rem;
	}

	.session-ex:first-child {
		margin-top: 0.75rem;
	}

	.sex-name {
		color: var(--color-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.sex-step {
		color: var(--color-text);
		text-align: right;
		font-size: 0.75rem;
		flex-shrink: 0;
	}

	.hidden {
		display: none;
		margin-bottom: 0 !important;
	}

	/* --- Mobile Responsiveness --- */
	@media (max-width: 768px) {
		.training-layout {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.col-header {
			gap: 0.75rem;
		}

		.program-link {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.3rem;
			padding: 0.8rem 1rem;
		}

		.ex-name,
		.sex-name {
			white-space: normal; /* Let text wrap naturally on smaller screens */
			word-wrap: break-word;
		}

		.ex-step,
		.sex-step {
			text-align: left;
			font-size: 0.75rem;
		}

		.session-card {
			padding: 0.8rem 1rem;
		}

		.session-ex {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.2rem;
			padding: 0.5rem 0;
		}

		.confirm-row {
			flex-direction: column;
			gap: 0.2rem;
		}
	}
</style>
