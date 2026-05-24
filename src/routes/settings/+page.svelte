<!-- src/routes/settings/+page.svelte -->
<script lang="ts">
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import { user } from "$lib/stores/user";
	import { supabase } from "$lib/supabase";

	let loading = $state(false);

	async function handleLogout() {
		loading = true;
		await supabase.auth.signOut();
		loading = false;
	}

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

	$effect(() => console.log($user));
</script>

<main class="page settings-page">
	<!-- Profile header -->
	<div class="profile-header">
		<div class="avatar">M</div>
		<div class="profile-info">
			<p class="profile-name">{$user?.display_name}</p>
			<p class="profile-email">{$user?.email}</p>
		</div>
		<i class="ti ti-chevron-right profile-chevron" aria-hidden="true"></i>
	</div>

	<!-- Aspetto -->
	<p class="section-label">Aspetto</p>
	<div class="group">
		<div class="row row--tappable">
			<span class="row-icon" style="background: #8e8e93">
				<i class="ti ti-moon" aria-hidden="true"></i>
			</span>
			<span class="row-label">Tema</span>
			<span class="row-value">Automatico</span>
			<i class="ti ti-chevron-right chevron" aria-hidden="true"></i>
		</div>
		<div class="row row--tappable">
			<span class="row-icon" style="background: #32ade6">
				<i class="ti ti-language" aria-hidden="true"></i>
			</span>
			<span class="row-label">Lingua</span>
			<span class="row-value">Italiano</span>
			<i class="ti ti-chevron-right chevron" aria-hidden="true"></i>
		</div>
	</div>

	<!-- Supporto -->
	<p class="section-label">Supporto</p>
	<div class="group">
		<div class="row row--tappable">
			<span class="row-icon" style="background: #007aff">
				<i class="ti ti-help" aria-hidden="true"></i>
			</span>
			<span class="row-label">Guida &amp; FAQ</span>
			<i class="ti ti-chevron-right chevron" aria-hidden="true"></i>
		</div>
		<div class="row row--tappable">
			<span class="row-icon" style="background: #5856d6">
				<i class="ti ti-message" aria-hidden="true"></i>
			</span>
			<span class="row-label">Contatta il supporto</span>
			<i class="ti ti-chevron-right chevron" aria-hidden="true"></i>
		</div>
		<div class="row">
			<span class="row-icon" style="background: #8e8e93">
				<i class="ti ti-info-circle" aria-hidden="true"></i>
			</span>
			<span class="row-label">Versione app</span>
			<span class="row-value">0.0.1</span>
		</div>
	</div>

	<!-- Zona pericolosa -->
	<p class="section-label">Zona pericolosa</p>
	<div class="group">
		<button
			class="row row--tappable"
			onclick={handleResetProgress}
			disabled={loading}
		>
			<span class="row-icon" style="background: #ff9500">
				<i class="ti ti-refresh" aria-hidden="true"></i>
			</span>
			<span class="row-label">Resetta i progressi</span>
			<i class="ti ti-chevron-right chevron" aria-hidden="true"></i>
		</button>
		<button
			class="row row--tappable row--destructive"
			onclick={handleClearTrainingHistory}
			disabled={loading}
		>
			<span class="row-icon" style="background: var(--color-danger)">
				<i class="ti ti-trash" aria-hidden="true"></i>
			</span>
			<span class="row-label">Elimina storico allenamenti</span>
			<i class="ti ti-chevron-right chevron" aria-hidden="true"></i>
		</button>
		<button
			class="row row--tappable row--destructive"
			onclick={handleLogout}
			disabled={loading}
		>
			<span class="row-icon" style="background: var(--color-danger)">
				<i class="ti ti-logout" aria-hidden="true"></i>
			</span>
			<span class="row-label">Logout</span>
		</button>
	</div>
</main>

<style>
	/* Layout */
	.settings-page {
		display: flex;
		flex-direction: column;
		padding-bottom: calc(var(--tab-bar-height) + 1rem);
	}

	/* Profile header — uses card token for surface */
	.profile-header {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 1.25rem var(--page-padding) 1rem;
		cursor: pointer;
	}

	.avatar {
		width: 58px;
		height: 58px;
		border-radius: 50%;
		background: var(--color-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 21px;
		font-weight: 700;
		color: #fff;
		flex-shrink: 0;
		letter-spacing: -0.02em;
	}

	.profile-info {
		flex: 1;
	}

	.profile-name {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.profile-email {
		margin: 2px 0 0;
		font-size: 0.8rem;
		color: var(--color-muted);
	}

	.profile-chevron {
		font-size: 14px;
		color: var(--color-muted);
	}

	/* Section label — matches .ios-section-label from global */
	.section-label {
		display: block;
		margin: 1.25rem var(--page-padding) 0.4rem;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-muted);
	}

	/* Group — same surface as .card */
	.group {
		background: var(--color-card);
		border-radius: var(--radius-card);
		margin: 0 var(--page-padding);
		overflow: hidden;
		box-shadow: var(--shadow-card);
	}

	/* Row */
	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0 14px;
		min-height: 46px;
		position: relative;
		/* reset button defaults */
		background: none;
		border: none;
		border-radius: 0;
		font-family: inherit;
		width: 100%;
		text-align: left;
		cursor: default;
		white-space: normal;
		transition: background 0.1s ease;
	}

	/* Separator — starts after the icon column */
	.row:not(:last-child)::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 56px;
		right: 0;
		height: 1px;
		background: var(--color-border);
	}

	.row--tappable {
		cursor: pointer;
	}

	.row--tappable:active:not(:disabled) {
		background: var(--color-track);
	}

	.row:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.row--destructive .row-label {
		color: var(--color-danger);
	}

	/* Icon badge */
	.row-icon {
		width: 30px;
		height: 30px;
		border-radius: 7px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 15px;
		color: #fff;
		flex-shrink: 0;
	}

	/* Row text — reuse app's existing font scale */
	.row-label {
		flex: 1;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.row-value {
		font-size: 0.85rem;
		color: var(--color-muted);
		margin-right: 2px;
	}

	.chevron {
		font-size: 12px;
		color: var(--color-muted);
		opacity: 0.45;
		margin-right: -2px;
	}

	/* Toggle — uses --color-track for off state, accent for on */
	.toggle {
		width: 51px;
		height: 31px;
		border-radius: 999px;
		background: var(--color-track);
		position: relative;
		cursor: pointer;
		flex-shrink: 0;
		padding: 0;
		border: none;
		transition: background 0.2s ease;
	}

	.toggle.on {
		background: var(--color-accent);
	}

	.toggle:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 27px;
		height: 27px;
		border-radius: 50%;
		background: var(--color-contrast);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s ease;
	}

	.toggle.on .toggle-thumb {
		transform: translateX(20px);
	}
</style>
