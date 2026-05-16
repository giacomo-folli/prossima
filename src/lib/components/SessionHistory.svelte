<script lang="ts">
	import { sessions } from "$lib/stores/sessions";

	let pastSessions = $derived($sessions.map((s) => ({ ...s, hidden: true })));
	function handleDeleteSession(e: Event, id: string) {
		e.stopPropagation();
		if (confirm("Questa azione eliminerà la sessione.\n\nContinuare?")) {
			sessions.deleteSession(id);
		}
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

		pastSessions = pastSessions.map((s) => {
			if (s.id == id) return { ...toggled, hidden: !toggled.hidden };
			else return s;
		});
	}
</script>

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
						<span class="session-date">{formatDate(session.completedAt)}</span>
						<span class="session-time">{formatTime(session.completedAt)}</span>
					</div>

					<button
						class="btn btn-delete"
						onclick={(e) => handleDeleteSession(e, session.id)}
						aria-label="Elimina sessione">×</button
					>
				</div>
				<div class="session-exercises" class:hidden={session.hidden}>
					{#each session.exercises.filter((e) => !e.type || e.type == "exercise") as ex}
						<li class="session-ex">
							<span class="sex-name">{ex.exerciseName}</span>
							<span class="sex-step">{ex.stepLabel}</span>
						</li>
					{/each}

					<div class="session-ex">
						<span class="sex-name">Quick exercises</span>
						<span class="sex-step">
							{session.exercises
								?.filter((e) => e?.type && e.type == "quick-exeercise")
								?.map((e) => e.exerciseName)
								?.join(" - ")}
						</span>
					</div>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<style>
	/* History */
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
	/* --- Mobile --- */
	@media (max-width: 768px) {
		.sex-name {
			white-space: normal;
			word-wrap: break-word;
		}

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
	}
</style>
