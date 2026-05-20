<!-- src/routes/auth/+page.svelte -->
<script lang="ts">
	import { supabase } from "$lib/supabase";

	let email = $state("");
	let password = $state("");
	let errorMessage = $state("");
	let loading = $state(false);
	let showPassword = $state(false);

	async function handleLogIn() {
		loading = true;
		errorMessage = "";
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) errorMessage = error.message;
		loading = false;
	}

	async function handleSignUp() {
		loading = true;
		errorMessage = "";
		const { error } = await supabase.auth.signUp({ email, password });
		if (error) errorMessage = error.message;
		loading = false;
	}
</script>

<div class="page">
	<div class="wrapper">
		<div class="brand">
			<div class="brand-icon">
				<i class="ti ti-barbell" aria-hidden="true"></i>
			</div>
			<p class="brand-name">Prossima</p>
		</div>

		<div class="card">
			<div class="field">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					placeholder="nome@esempio.it"
					bind:value={email}
					disabled={loading}
				/>
			</div>

			<div class="field">
				<label for="password">Password</label>
				<div class="password-wrap">
					<input
						id="password"
						type={showPassword ? "text" : "password"}
						placeholder="••••••••"
						bind:value={password}
						disabled={loading}
					/>
					<button
						class="eye-btn"
						type="button"
						onclick={() => (showPassword = !showPassword)}
						aria-label="Mostra/nascondi password"
					>
						<i
							class={showPassword ? "ti ti-eye-off" : "ti ti-eye"}
							aria-hidden="true"
						></i>
					</button>
				</div>
			</div>

			{#if errorMessage}
				<p class="error">{errorMessage}</p>
			{/if}

			<div class="actions">
				<button
					class="btn btn--primary"
					onclick={handleLogIn}
					disabled={loading || !email || !password}
				>
					{loading ? "Accesso…" : "Accedi"}
				</button>
				<button
					class="btn btn--ghost"
					onclick={handleSignUp}
					disabled={loading || !email || !password}
				>
					Registrati
				</button>
			</div>
		</div>

		<p class="footer-hint">Accedi o crea un account per iniziare.</p>
	</div>
</div>

<style>
	@import "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css";

	.page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
	}

	.wrapper {
		width: 100%;
		max-width: 360px;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	/* Brand */
	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.brand-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		border: 1px solid var(--color-border, #e5e7eb);
		background: var(--color-surface-secondary, #f9fafb);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.brand-icon i {
		font-size: 22px;
		color: var(--color-text, #111);
	}

	.brand-name {
		margin: 0;
		font-size: 15px;
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--color-text, #111);
	}

	/* Card */
	.card {
		background: var(--color-surface, #fff);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 14px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Fields */
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	label {
		font-size: 12px;
		color: var(--color-muted, #6b7280);
		letter-spacing: 0.02em;
	}

	input {
		font-family: inherit;
		font-size: 14px;
		color: var(--color-text, #111);
		background: var(--color-surface-secondary, #f9fafb);
		border: 1px solid var(--color-border, #e5e7eb);
		border-radius: 8px;
		padding: 0.6rem 0.75rem;
		width: 100%;
		outline: none;
		transition: border-color 0.15s;
		box-sizing: border-box;
	}

	input:focus {
		border-color: var(--color-text, #111);
	}

	input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	input::placeholder {
		color: var(--color-muted, #9ca3af);
	}

	/* Password toggle */
	.password-wrap {
		position: relative;
	}

	.password-wrap input {
		padding-right: 2.5rem;
	}

	.eye-btn {
		position: absolute;
		right: 0.6rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: var(--color-muted, #9ca3af);
		display: flex;
		align-items: center;
		line-height: 1;
	}

	.eye-btn i {
		font-size: 16px;
	}

	/* Error */
	.error {
		margin: 0;
		font-size: 12px;
		color: var(--color-danger, #dc2626);
		text-align: center;
	}

	/* Actions */
	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.btn {
		width: 100%;
		padding: 0.65rem;
		border-radius: 8px;
		font-size: 14px;
		font-family: inherit;
		cursor: pointer;
		transition:
			opacity 0.15s,
			background 0.15s;
		letter-spacing: -0.01em;
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn--primary {
		background: var(--color-text, #111);
		color: var(--color-surface, #fff);
		border: none;
		font-weight: 500;
	}

	.btn--primary:hover:not(:disabled) {
		opacity: 0.85;
	}

	.btn--ghost {
		background: transparent;
		color: var(--color-text, #111);
		border: 1px solid var(--color-border, #e5e7eb);
		font-weight: 400;
	}

	.btn--ghost:hover:not(:disabled) {
		background: var(--color-surface-secondary, #f9fafb);
	}

	/* Footer */
	.footer-hint {
		margin: 0;
		text-align: center;
		font-size: 12px;
		color: var(--color-muted, #9ca3af);
	}
</style>
