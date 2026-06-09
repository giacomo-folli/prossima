<script lang="ts">
	import { user } from "$lib/stores/user";
	import { updateUserProfile } from "$lib/utils/storage";
	import Icon from "$lib/components/Icon.svelte";
	import posthog from "posthog-js";
	import { resolve } from "$app/paths";

	let displayName = $state("");
	let fullName = $state("");
	let avatarUrl = $state("");
	let customAvatarUrl = $state("");

	let saving = $state(false);
	let statusMessage = $state<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const avatars = [
		"/prossima/avatars/avatar_1.png",
		"/prossima/avatars/avatar_2.png",
		"/prossima/avatars/avatar_3.png",
	];

	let initialized = $state(false);

	$effect(() => {
		if ($user && !initialized) {
			displayName = $user.display_name || "";
			fullName = $user.full_name || "";
			avatarUrl = $user.avatar_url || "";
			if ($user.avatar_url && !avatars.includes($user.avatar_url)) {
				customAvatarUrl = $user.avatar_url;
			}
			initialized = true;
		}
	});

	function selectAvatar(url: string) {
		avatarUrl = url;
		customAvatarUrl = "";
	}

	function handleCustomAvatarChange(e: Event) {
		const target = e.target as HTMLInputElement;
		avatarUrl = target.value;
		customAvatarUrl = target.value;
	}

	async function handleSave() {
		saving = true;
		statusMessage = null;

		try {
			posthog.capture("profile_update_attempted");
			const updated = await updateUserProfile({
				display_name: displayName.trim(),
				full_name: fullName.trim(),
				avatar_url: avatarUrl.trim() || undefined,
			});

			if (updated) {
				user.update((u) => (u ? { ...u, ...updated } : null));
				statusMessage = {
					type: "success",
					text: "Profilo aggiornato con successo!",
				};
				posthog.capture("profile_updated_successfully");
				setTimeout(() => {
					statusMessage = null;
				}, 4000);
			} else {
				statusMessage = {
					type: "error",
					text: "Errore durante l'aggiornamento. Riprova.",
				};
			}
		} catch (error) {
			console.error("Save profile error:", error);
			statusMessage = { type: "error", text: "Errore imprevisto. Riprova." };
		} finally {
			saving = false;
		}
	}
</script>

<main class="page profile-edit-page">
	<a href={resolve("/settings")} class="nav-back">
		<Icon name="chevron-left" size={20} />
		Impostazioni
	</a>

	<div class="header-section">
		<h1 class="large-title">Modifica Profilo</h1>
		<p class="page-subtitle">Gestisci le tue informazioni personali</p>
	</div>

	{#if statusMessage}
		<div class="status-banner {statusMessage.type}" role="alert">
			<Icon
				name={statusMessage.type === "success" ? "circle-check" : "info"}
				size={18}
			/>
			<span>{statusMessage.text}</span>
		</div>
	{/if}

	<!-- Visual Profile Card -->
	<div class="profile-preview-card">
		<div class="preview-avatar-container">
			{#if avatarUrl}
				<img src={avatarUrl} alt="Avatar Preview" class="preview-avatar" />
			{:else}
				<div class="preview-avatar-placeholder">
					{(displayName || $user?.email || "?").charAt(0).toUpperCase()}
				</div>
			{/if}
		</div>
		<div class="preview-info">
			<h3>{displayName || "Utente"}</h3>
			<p>{$user?.email || ""}</p>
		</div>
	</div>

	<!-- Profile Form -->
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSave();
		}}
		class="profile-form"
	>
		<p class="section-label">Informazioni Personali</p>
		<div class="group">
			<div class="form-row">
				<label for="display_name" class="field-label">Nome visualizzato</label>
				<input
					type="text"
					id="display_name"
					bind:value={displayName}
					placeholder="Es. Mario"
					disabled={saving}
					required
					class="form-input"
				/>
			</div>
			<div class="form-row">
				<label for="full_name" class="field-label">Nome completo</label>
				<input
					type="text"
					id="full_name"
					bind:value={fullName}
					placeholder="Es. Mario Rossi"
					disabled={saving}
					class="form-input"
				/>
			</div>
			<div class="form-row read-only">
				<label for="email" class="field-label">Email</label>
				<input
					type="email"
					id="email"
					value={$user?.email || ""}
					disabled
					class="form-input"
				/>
				<span class="input-hint">L'email non può essere modificata</span>
			</div>
		</div>

		<p class="section-label">Avatar</p>
		<div class="group avatar-selection-group">
			<div class="avatars-picker">
				<!-- Default Initials option -->
				<button
					type="button"
					class="avatar-option initials-option"
					class:selected={!avatarUrl}
					onclick={() => selectAvatar("")}
					disabled={saving}
					aria-label="Usa iniziali"
				>
					{(displayName || $user?.email || "?").charAt(0).toUpperCase()}
				</button>

				<!-- Curated pre-generated avatars -->
				{#each avatars as url, i}
					<button
						type="button"
						class="avatar-option"
						class:selected={avatarUrl === url}
						onclick={() => selectAvatar(url)}
						disabled={saving}
						aria-label="Avatar {i + 1}"
					>
						<img src={url} alt="Avatar Option {i + 1}" />
					</button>
				{/each}
			</div>

			<div class="custom-url-row">
				<label for="custom_avatar" class="field-label"
					>O usa un URL personalizzato</label
				>
				<input
					type="url"
					id="custom_avatar"
					bind:value={customAvatarUrl}
					oninput={handleCustomAvatarChange}
					placeholder="https://esempio.com/immagine.jpg"
					disabled={saving}
					class="form-input"
				/>
			</div>
		</div>

		<div class="actions">
			<button type="submit" class="btn btn-primary btn-save" disabled={saving}>
				{#if saving}
					<span class="spinner"></span>
					Salvataggio in corso...
				{:else}
					Salva modifiche
				{/if}
			</button>
		</div>
	</form>
</main>

<style>
	.profile-edit-page {
		display: flex;
		flex-direction: column;
		padding: 0 0 calc(var(--tab-bar-height) + 1.5rem);
	}

	.header-section {
		margin-bottom: 1.5rem;
	}

	/* Status Banner */
	.status-banner {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 1.25rem;
		animation: var(--anim-fade-up);
	}

	.status-banner.success {
		background: rgba(34, 197, 94, 0.15);
		color: var(--color-success);
		border: 1px solid rgba(34, 197, 94, 0.2);
	}

	.status-banner.error {
		background: var(--color-danger-subtle);
		color: var(--color-danger);
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	/* Profile Preview Card */
	.profile-preview-card {
		display: flex;
		align-items: center;
		gap: 18px;
		background: var(--color-card);
		border-radius: var(--radius-card);
		padding: 18px;
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-card);
		margin-bottom: 1.5rem;
	}

	.preview-avatar-container {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		overflow: hidden;
		background: var(--color-accent);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
		flex-shrink: 0;
	}

	.preview-avatar {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.preview-avatar-placeholder {
		font-size: 28px;
		font-weight: 700;
		color: #fff;
	}

	.preview-info h3 {
		margin: 0;
		font-size: 19px;
		font-weight: 700;
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.preview-info p {
		margin: 3px 0 0;
		font-size: 14px;
		color: var(--color-muted);
	}

	/* Form & Groups */
	.group {
		background: var(--color-card);
		border-radius: var(--radius-card);
		overflow: hidden;
		box-shadow: var(--shadow-card);
		border: 1px solid var(--color-border);
		margin-bottom: 1.5rem;
		display: flex;
		flex-direction: column;
	}

	.form-row {
		display: flex;
		flex-direction: column;
		padding: 14px 16px;
		position: relative;
	}

	.form-row:not(:last-child)::after {
		content: "";
		position: absolute;
		bottom: 0;
		left: 16px;
		right: 16px;
		height: 1px;
		background: var(--color-border);
	}

	.form-row.read-only {
		background: rgba(0, 0, 0, 0.01);
	}

	:global(html.dark) .form-row.read-only {
		background: rgba(255, 255, 255, 0.01);
	}

	.field-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 6px;
	}

	.form-input {
		background: transparent;
		border: none;
		font-family: inherit;
		font-size: 16px;
		color: var(--color-text);
		padding: 4px 0;
		width: 100%;
	}

	.form-input::placeholder {
		color: var(--color-text-disabled);
	}

	.form-input:disabled {
		opacity: 0.6;
	}

	.input-hint {
		font-size: 11px;
		color: var(--color-muted);
		margin-top: 4px;
	}

	/* Avatar Selection */
	.avatar-selection-group {
		padding: 16px;
		gap: 16px;
	}

	.avatars-picker {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.avatar-option {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		overflow: hidden;
		cursor: pointer;
		border: 2px solid transparent;
		background: var(--color-bg);
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			transform 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
	}

	.avatar-option:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
	}

	.avatar-option.selected {
		border-color: var(--color-accent);
		transform: scale(1.05);
		box-shadow: 0 0 0 3px var(--color-accent-dim);
	}

	.avatar-option img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.initials-option {
		font-size: 18px;
		font-weight: 700;
		color: #fff;
		background: var(--color-muted);
	}

	.custom-url-row {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--color-border);
		padding-top: 16px;
	}

	/* Actions */
	.actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 0.5rem;
	}

	.btn-save {
		width: 100%;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	@media (min-width: 600px) {
		.btn-save {
			width: auto;
			min-width: 160px;
		}
	}

	/* Spinner animation */
	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: #fff;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
