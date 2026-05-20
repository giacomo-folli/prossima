<!-- src/routes/settings/+page.svelte -->
<script lang="ts">
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import { supabase } from "$lib/supabase";

	let loading = $state(false);

	async function handleLogout() {
		loading = true;
		await supabase.auth.signOut();
		loading = false;
	}

	async function handleResetProgress() {
		if (confirm("Resettare i progressi correnti? Lo storico rimarrà intatto.")) {
			loading = true;
			exercises.clearProgress();
			loading = false;
		}
	}

	async function handleClearTrainingHistory() {
		if (confirm("ATTENZIONE: Questo cancellerà definitivamente tutto lo storico allenamenti.")) {
			loading = true;
			sessions.clearSessions();
			loading = false;
		}
	}
</script>

<div class="settings-container">

	<!-- Profilo -->
	<section class="card">
		<div class="section-header">
			<span class="section-title">Profilo</span>
		</div>
		<p class="section-desc">Gestisci il tuo account.</p>
		<div class="card-actions">
			<button class="btn btn--secondary" onclick={handleLogout} disabled={loading}>
				Logout
			</button>
		</div>
	</section>

	<!-- Danger zone -->
	<section class="card danger-card">
		<div class="section-header">
			<span class="section-title danger-title">Danger zone</span>
		</div>
		<p class="section-desc">Queste azioni sono irreversibili.</p>
		<div class="danger-buttons">
			<div class="danger-row">
				<div>
					<p class="danger-label">Resetta i progressi</p>
					<p class="danger-desc">Azzera lo step corrente di ogni esercizio. Lo storico sessioni rimarrà intatto.</p>
				</div>
				<button class="btn btn-danger" onclick={handleResetProgress} disabled={loading}>
					Resetta
				</button>
			</div>
			<div class="divider"></div>
			<div class="danger-row">
				<div>
					<p class="danger-label">Elimina lo storico</p>
					<p class="danger-desc">Cancella definitivamente tutte le sessioni di allenamento registrate.</p>
				</div>
				<button class="btn btn-danger" onclick={handleClearTrainingHistory} disabled={loading}>
					Elimina
				</button>
			</div>
		</div>
	</section>

</div>

<style>
	:root {
		--color-danger-card-bg: rgba(220, 38, 38, 0.07);
		--color-danger-card-border: rgba(220, 38, 38, 0.15);
		--color-danger-title: rgba(185, 28, 28, 0.9);
		--color-danger-btn-bg: rgba(220, 38, 38, 0.12);
		--color-danger-btn-text: rgba(185, 28, 28, 0.95);
		--color-danger-btn-bg-hover: rgba(220, 38, 38, 0.22);
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--color-danger-card-bg: rgba(255, 0, 0, 0.08);
			--color-danger-card-border: rgba(255, 0, 0, 0.15);
			--color-danger-title: rgba(255, 100, 100, 0.9);
			--color-danger-btn-bg: rgba(255, 0, 0, 0.15);
			--color-danger-btn-text: rgba(255, 180, 180, 0.95);
			--color-danger-btn-bg-hover: rgba(255, 0, 0, 0.26);
		}
	}

	.settings-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Card actions row (profile) */
	.card-actions {
		margin-top: 0.85rem;
	}

	/* Danger card */
	.danger-card {
		background: var(--color-danger-card-bg);
		border-color: var(--color-danger-card-border);
	}

	.danger-title {
		color: var(--color-danger-title);
	}

	.danger-buttons {
		margin-top: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.danger-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 0.85rem 0;
	}

	.divider {
		height: 1px;
		background: var(--color-danger-card-border);
	}

	.danger-label {
		margin: 0 0 0.2rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.danger-desc {
		margin: 0;
		font-size: 0.78rem;
		color: var(--color-muted);
		line-height: 1.4;
	}

	.btn-danger {
		flex-shrink: 0;
		background: var(--color-danger-btn-bg);
		color: var(--color-danger-btn-text);
		border: none;
	}

	.btn-danger:hover:not(:disabled) {
		background: var(--color-danger-btn-bg-hover);
		opacity: 1;
	}
</style>