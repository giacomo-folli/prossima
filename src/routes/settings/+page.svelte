<script lang="ts">
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import { user } from "$lib/stores/user";
	import { supabase } from "$lib/supabase";
	import posthog from "posthog-js";
	import Icon from "$lib/components/Icon.svelte";
	import { onMount } from "svelte";
	import { resolve } from "$app/paths";

	let loading = $state(false);
	let theme = $state("auto");

	onMount(() => {
		theme = localStorage.getItem("theme") || "auto";
	});

	function cycleTheme() {
		let nextTheme = "auto";
		if (theme === "auto") nextTheme = "light";
		else if (theme === "light") nextTheme = "dark";
		else if (theme === "dark") nextTheme = "auto";

		theme = nextTheme;
		localStorage.setItem("theme", nextTheme);
		window.dispatchEvent(new Event("theme-changed"));
		posthog.capture("theme_changed", { theme: nextTheme });
	}

	const themeLabel = $derived(
		theme === "light" ? "Chiaro" : theme === "dark" ? "Scuro" : "Automatico",
	);

	async function handleLogout() {
		loading = true;
		posthog.capture("user_logged_out");
		posthog.reset();
		await supabase.auth.signOut();
		loading = false;
	}

	async function handleResetProgress() {
		if (
			confirm("Resettare i progressi correnti? Lo storico rimarrà intatto.")
		) {
			loading = true;
			posthog.capture("exercise_progress_reset");
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
			posthog.capture("training_history_cleared");
			sessions.clearSessions();
			loading = false;
		}
	}
</script>

<main class="page settings-page">
	<!-- Profile header -->
	<a href={resolve("/settings/profile")} class="profile-header">
		{#if $user?.avatar_url}
			<img src={$user.avatar_url} alt="Avatar" class="avatar avatar-img" />
		{:else}
			<div class="avatar">
				{($user?.display_name || $user?.email || "?").charAt(0).toUpperCase()}
			</div>
		{/if}
		<div class="profile-info">
			<p class="profile-name">{$user?.display_name || "Utente"}</p>
			<p class="profile-email">{$user?.email}</p>
		</div>
		<Icon name="chevron-right" size={16} class="profile-chevron" />
	</a>

	<!-- Aspetto -->
	<p class="section-label">Aspetto</p>
	<div class="group">
		<button type="button" class="row row--tappable" onclick={cycleTheme}>
			<span class="row-icon" style="background: #8e8e93">
				<Icon name="moon" size={16} />
			</span>
			<span class="row-label">Tema</span>
			<span class="row-value">{themeLabel}</span>
			<Icon name="chevron-right" size={14} class="chevron" />
		</button>
		<!-- <div class="row row--tappable">
			<span class="row-icon" style="background: #32ade6">
				<Icon name="language" size={16} />
			</span>
			<span class="row-label">Lingua</span>
			<span class="row-value">Italiano</span>
			<Icon name="chevron-right" size={14} class="chevron" />
		</div> -->
	</div>

	<!-- Supporto -->
	<p class="section-label">Supporto</p>
	<div class="group">
		<button
			type="button"
			class="row row--tappable"
			onclick={() =>
				alert("Il supporto è quel gay di gepy, mandagli un messaggio")}
		>
			<span class="row-icon" style="background: #5856d6">
				<Icon name="message" size={16} />
			</span>
			<span class="row-label">Contatta il supporto</span>
			<Icon name="chevron-right" size={14} class="chevron" />
		</button>
		<div class="row">
			<span class="row-icon" style="background: #8e8e93">
				<Icon name="info" size={16} />
			</span>
			<span class="row-label">Versione app</span>
			<span class="row-value">0.0.1</span>
		</div>
	</div>

	<!-- Zona pericolosa -->
	<p class="section-label">Zona pericolosa</p>
	<div class="group group--danger">
		<button
			class="row row--tappable"
			onclick={handleResetProgress}
			disabled={loading}
		>
			<span class="row-icon" style="background: #ff9500">
				<Icon name="refresh" size={16} />
			</span>
			<span class="row-label">Resetta i progressi</span>
			<Icon name="chevron-right" size={14} class="chevron" />
		</button>
		<button
			class="row row--tappable row--destructive"
			onclick={handleClearTrainingHistory}
			disabled={loading}
		>
			<span class="row-icon" style="background: var(--color-danger)">
				<Icon name="trash" size={16} />
			</span>
			<span class="row-label">Elimina storico allenamenti</span>
			<Icon name="chevron-right" size={14} class="chevron" />
		</button>
		<button
			class="row row--tappable row--destructive"
			onclick={handleLogout}
			disabled={loading}
		>
			<span class="row-icon" style="background: var(--color-danger)">
				<Icon name="logout" size={16} />
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
		padding: 0 0 calc(var(--tab-bar-height) + 1rem);
	}

	/* Profile header */
	.profile-header {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 1.25rem 0 1rem;
		cursor: pointer;
		min-height: 56px;
		transition: opacity 0.2s ease;
	}

	.profile-header:active {
		opacity: 0.7;
	}

	.avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--color-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		font-weight: 700;
		color: #fff;
		flex-shrink: 0;
		letter-spacing: -0.02em;
	}

	.avatar-img {
		object-fit: cover;
	}

	.profile-info {
		flex: 1;
	}

	.profile-name {
		margin: 0;
		font-size: 17px;
		font-weight: 600;
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.profile-email {
		margin: 2px 0 0;
		font-size: 13px;
		color: var(--color-muted);
	}

	:global(.profile-chevron) {
		color: var(--color-muted);
		opacity: 0.5;
	}

	/* Section label */
	.section-label {
		display: block;
		margin: 1.25rem 0 0.4rem;
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: var(--color-muted);
	}

	/* Group */
	.group {
		background: var(--color-card);
		border-radius: var(--radius-card);
		overflow: hidden;
		box-shadow: var(--shadow-card);
		border: 1px solid var(--color-border);
	}

	.group--danger {
		background: #fee2e2;
		border: 1px solid rgba(239, 68, 68, 0.25);
	}

	:global(html.dark) .group--danger {
		background: rgba(255, 69, 58, 0.15);
		border-color: rgba(255, 69, 58, 0.25);
	}

	/* Row */
	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0 14px;
		min-height: 52px;
		position: relative;
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

	/* Separator */
	.row:not(:last-child)::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 56px;
		right: 0;
		height: 1px;
		background: var(--color-border);
	}

	.group--danger .row:not(:last-child)::after {
		background: rgba(239, 68, 68, 0.2);
	}

	.row--tappable {
		cursor: pointer;
	}

	.row--tappable:active:not(:disabled) {
		background: var(--color-track);
	}

	.group--danger .row--tappable:active:not(:disabled) {
		background: rgba(239, 68, 68, 0.1);
	}

	:global(html.dark) .group--danger .row--tappable:active:not(:disabled) {
		background: rgba(255, 69, 58, 0.1);
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
		color: #fff;
		flex-shrink: 0;
	}

	/* Row text */
	.row-label {
		flex: 1;
		font-size: 15px;
		font-weight: 500;
		color: var(--color-text);
	}

	.group--danger .row-label {
		color: #ef4444;
	}

	:global(html.dark) .group--danger .row-label {
		color: #ff453a;
	}

	.row-value {
		font-size: 13px;
		color: var(--color-muted);
		margin-right: 2px;
	}

	:global(.chevron) {
		color: var(--color-muted);
		opacity: 0.45;
		margin-right: -2px;
	}
</style>
