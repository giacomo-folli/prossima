<script lang="ts">
	import { onMount } from "svelte";
	import { supabase } from "$lib/supabase";
	import { resolve } from "$app/paths";
	import Icon from "$lib/components/Icon.svelte";
	import { DateTime } from "luxon";

	interface AdminSession {
		id: string;
		completed_at: string;
		exercises: any[];
		notes: string | null;
		liked: boolean;
		user_id: string;
		display_name: string | null;
		full_name: string | null;
		avatar_url: string | null;
	}

	let sessions = $state<AdminSession[]>([]);
	let loading = $state(true);
	let errorMsg = $state<string | null>(null);

	async function fetchSessions() {
		loading = true;
		errorMsg = null;
		try {
			const { data, error } = await supabase.rpc("get_admin_sessions");
			if (error) {
				console.error("Errore nel caricamento delle sessioni admin:", error);
				errorMsg =
					"Impossibile caricare le sessioni. Assicurati di aver eseguito le migrazioni del database.";
			} else {
				sessions = data || [];
			}
		} catch (err) {
			console.error("Runtime error fetching admin sessions:", err);
			errorMsg = "Si è verificato un errore imprevisto durante il caricamento.";
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchSessions();
	});

	function formatDate(isoString: string): string {
		return DateTime.fromISO(isoString)
			.setLocale("it")
			.toFormat("d LLL yyyy, HH:mm");
	}

	function getDaysAgo(isoString: string): string {
		const diff = Math.floor(
			(Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60 * 24),
		);
		if (diff === 0) return "oggi";
		if (diff === 1) return "ieri";
		return `${diff} giorni fa`;
	}

	function getUserHue(userId: string): number {
		const id = userId || "";
		let hash = 2166136261;
		for (let i = 0; i < id.length; i++) {
			hash ^= id.charCodeAt(i);
			hash = Math.imul(hash, 16777619);
		}
		// Scatter consecutive/similar values using the golden ratio conjugate
		const h = Math.abs(hash) * 0.618033988749895;
		return Math.floor((h % 1) * 360);
	}
</script>

<main class="page feed-page">
	<div class="top-bar">
		<a href={resolve("/home")} class="nav-back">
			<Icon name="chevron-left" size={20} />
			Home
		</a>
		<button
			class="refresh-btn btn-secondary"
			onclick={fetchSessions}
			disabled={loading}
			aria-label="Aggiorna sessioni"
		>
			<Icon name="refresh" size={16} class={loading ? "spin" : ""} />
			<span>Aggiorna</span>
		</button>
	</div>

	<header class="page-header">
		<p class="page-subtitle">Community</p>
		<h1 class="large-title">Feed</h1>
	</header>

	{#if loading && sessions.length === 0}
		<div class="loading-state ios-card">
			<div class="spinner-large"></div>
			<p>Caricamento delle ultime sessioni in corso...</p>
		</div>
	{:else if errorMsg}
		<div class="status-banner error">
			<Icon name="info" size={20} />
			<div class="error-content">
				<p class="error-text">{errorMsg}</p>
				<button class="btn btn-secondary btn-retry" onclick={fetchSessions}
					>Riprova</button
				>
			</div>
		</div>
	{:else if sessions.length === 0}
		<div class="empty-state ios-card">
			<Icon name="mood-puzzled" size={48} class="empty-icon" />
			<p class="empty-text">Nessuna sessione registrata dagli utenti.</p>
		</div>
	{:else}
		<div class="sessions-container">
			{#each sessions as session (session.id)}
				<div class="session-card ios-card" style="--user-hue: {getUserHue(session.user_id)}">
					<div class="session-user">
						{#if session.avatar_url}
							<img
								src={session.avatar_url}
								alt="Avatar"
								class="user-avatar img-avatar"
							/>
						{:else}
							<div class="user-avatar initials-avatar">
								{(session.display_name || session.full_name || "?")
									.charAt(0)
									.toUpperCase()}
							</div>
						{/if}
						<div class="user-details">
							<div class="user-name-row">
								<span class="user-name"
									>{session.display_name ||
										session.full_name ||
										"Utente Anonimo"}</span
								>
								{#if session.liked}
									<span class="liked-badge" title="Sessione piaciuta">
										<Icon name="heart" size={14} class="liked-icon" />
									</span>
								{/if}
							</div>
							<span class="session-time">
								{formatDate(session.completed_at)}
								<span class="time-ago"
									>({getDaysAgo(session.completed_at)})</span
								>
							</span>
						</div>
					</div>

					{#if session.notes}
						<div class="session-notes">
							<Icon name="notes" size={14} class="notes-icon" />
							<p class="notes-text">"{session.notes}"</p>
						</div>
					{/if}

					<div class="exercises-section">
						<span class="section-label"
							>Esercizi ({session.exercises.length})</span
						>
						<div class="exercises-list">
							{#each session.exercises as ex}
								<div
									class="exercise-chip"
									class:quick={ex.type === "quick_exercise"}
								>
									{#if ex.type === "quick_exercise"}
										<span class="ex-icon">{ex.icon || "⚡"}</span>
									{:else}
										<span class="ex-icon-svg">
											<Icon name="dumbbell" size={12} />
										</span>
									{/if}
									<div class="ex-info">
										<span class="ex-name">{ex.name}</span>
										{#if ex.step_label}
											<span class="ex-step">{ex.step_label}</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</main>

<style>
	.feed-page {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 0 0 calc(var(--tab-bar-height) + 1.5rem);
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		min-height: 44px;
	}

	.refresh-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
		padding: 0.5rem 0.85rem;
		border-radius: 12px;
	}

	.page-header {
		margin-bottom: 0.25rem;
	}

	/* Loading state */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1.5rem;
		text-align: center;
		gap: 1rem;
	}

	.spinner-large {
		width: 36px;
		height: 36px;
		border: 3px solid var(--color-track);
		border-radius: 50%;
		border-top-color: var(--color-accent);
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	:global(.spin) {
		animation: spin 1.2s linear infinite;
	}

	/* Error state */
	.status-banner.error {
		display: flex;
		gap: 12px;
		padding: 16px;
		background: var(--color-danger-subtle);
		color: var(--color-danger);
		border: 1px solid rgba(239, 68, 68, 0.25);
		border-radius: var(--radius-card);
		align-items: flex-start;
	}

	.error-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
	}

	.error-text {
		margin: 0;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.4;
	}

	.btn-retry {
		align-self: flex-start;
		font-size: 12px;
		padding: 0.35rem 0.75rem;
		border-radius: 8px;
		background: transparent;
		color: var(--color-danger);
		border: 1px solid var(--color-danger);
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1.5rem;
		text-align: center;
		gap: 12px;
	}

	:global(.empty-icon) {
		color: var(--color-muted);
		opacity: 0.6;
	}

	.empty-text {
		margin: 0;
		font-size: 15px;
		color: var(--color-muted);
	}

	/* Sessions list */
	.sessions-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.session-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 18px;
		border: 1px solid var(--color-border);
		background: linear-gradient(
			135deg,
			hsl(var(--user-hue, 200), 45%, 97%) 0%,
			hsl(var(--user-hue, 200), 35%, 98%) 100%
		);
		border-color: hsl(var(--user-hue, 200), 40%, 90%);
		transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
	}

	:global(html.dark) .session-card {
		background: linear-gradient(
			135deg,
			hsl(var(--user-hue, 200), 30%, 11%) 0%,
			hsl(var(--user-hue, 200), 20%, 9%) 100%
		);
		border-color: hsl(var(--user-hue, 200), 25%, 19%);
	}

	/* User profile header */
	.session-user {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.user-avatar {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
		border: 2px solid hsl(var(--user-hue, 200), 50%, 65%);
	}

	:global(html.dark) .user-avatar {
		border-color: hsl(var(--user-hue, 200), 45%, 55%);
	}

	.img-avatar {
		object-fit: cover;
	}

	.initials-avatar {
		background: hsl(var(--user-hue, 200), 55%, 45%);
		color: white;
		font-size: 16px;
		font-weight: 700;
	}

	.user-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.user-name-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.user-name {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.liked-badge {
		display: inline-flex;
		color: #e53e3e;
		flex-shrink: 0;
	}

	:global(html.dark) .liked-badge {
		color: #fc8181;
	}

	.session-time {
		font-size: 12px;
		color: var(--color-muted);
	}

	.time-ago {
		opacity: 0.85;
	}

	/* Notes block */
	.session-notes {
		display: flex;
		gap: 8px;
		background: hsl(var(--user-hue, 200), 40%, 94%);
		padding: 10px 12px;
		border-radius: 10px;
		align-items: flex-start;
		border-left: 3px solid hsl(var(--user-hue, 200), 55%, 45%);
	}

	:global(html.dark) .session-notes {
		background: hsl(var(--user-hue, 200), 20%, 8%);
		border-left-color: hsl(var(--user-hue, 200), 45%, 45%);
	}

	:global(.notes-icon) {
		color: hsl(var(--user-hue, 200), 55%, 42%);
		margin-top: 2px;
		opacity: 0.8;
	}

	:global(html.dark) :global(.notes-icon) {
		color: hsl(var(--user-hue, 200), 45%, 65%);
	}

	.notes-text {
		margin: 0;
		font-size: 13.5px;
		font-style: italic;
		line-height: 1.45;
		color: var(--color-text);
		opacity: 0.95;
	}

	/* Exercises section */
	.exercises-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.section-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--color-muted);
	}

	.exercises-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.exercise-chip {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background: hsl(var(--user-hue, 200), 30%, 94%);
		border-radius: 10px;
		border: 1px solid hsl(var(--user-hue, 200), 35%, 88%);
		max-width: 100%;
	}

	:global(html.dark) .exercise-chip {
		background: hsl(var(--user-hue, 200), 20%, 7%);
		border-color: hsl(var(--user-hue, 200), 20%, 15%);
	}

	.exercise-chip.quick {
		background: rgba(82, 183, 136, 0.05);
		border-color: rgba(82, 183, 136, 0.15);
	}

	:global(html.dark) .exercise-chip.quick {
		background: rgba(82, 183, 136, 0.08);
		border-color: rgba(82, 183, 136, 0.2);
	}

	.ex-icon {
		font-size: 13px;
		line-height: 1;
		flex-shrink: 0;
	}

	.ex-icon-svg {
		color: hsl(var(--user-hue, 200), 55%, 42%);
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	:global(html.dark) .ex-icon-svg {
		color: hsl(var(--user-hue, 200), 45%, 65%);
	}

	.ex-info {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.ex-name {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ex-step {
		font-size: 11px;
		color: var(--color-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 1px;
	}
</style>
