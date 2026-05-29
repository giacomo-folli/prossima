<script lang="ts">
	import { supabase } from "$lib/supabase";
	import posthog from "posthog-js";
	import Icon from "$lib/components/Icon.svelte";

	let email = $state("");
	let name = $state("");
	let password = $state("");
	let errorMessage = $state("");
	let loading = $state(false);
	let showPassword = $state(false);
	let isSignUp = $state(false);

	async function handleLogIn() {
		loading = true;
		errorMessage = "";

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			errorMessage = error.message;
		} else if (data.user) {
			posthog.identify(data.user.id, { email: data.user.email });
			posthog.capture("user_logged_in", { email: data.user.email });
		}

		loading = false;
	}

	async function handleSignUp() {
		loading = true;
		errorMessage = "";

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { display_name: name },
			},
		});

		if (error) {
			errorMessage = error.message;
		} else {
			if (data.user) {
				posthog.identify(data.user.id, { email: data.user.email, name });
				posthog.capture("user_signed_up", { email: data.user.email });
			}
			alert(
				"Controlla la tua casella di posta.\nTi abbiamo mandato un'email di conferma.",
			);
		}

		loading = false;
	}
</script>

<div class="auth-page">
	<div class="wrapper">
		<div class="brand">
			<div class="brand-icon">
				<Icon name="dumbbell" size={26} />
			</div>
			<h1 class="brand-name">Prossima</h1>
			<p class="brand-sub">Il tuo allenamento, ogni giorno</p>
		</div>

		<div class="form-stack">
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
						<Icon name={showPassword ? "eye-off" : "eye"} size={18} />
					</button>
				</div>
			</div>

			{#if isSignUp}
				<div class="field">
					<label for="name">Nome</label>
					<input
						id="name"
						type="string"
						placeholder="Lilli"
						bind:value={name}
						disabled={loading}
					/>
				</div>
			{/if}

			{#if errorMessage}
				<p class="error">{errorMessage}</p>
			{/if}

			{#if isSignUp}
				<button
					class="btn btn--primary btn-login"
					onclick={handleSignUp}
					disabled={loading || !email || !password}
				>
					Crea account
				</button>
			{:else}
				<button
					class="btn btn--primary btn-login"
					onclick={handleLogIn}
					disabled={loading || !email || !password}
				>
					{loading ? "Accesso…" : "Accedi"}
				</button>
			{/if}

			<div class="divider">
				<span>oppure</span>
				{#if isSignUp}
					<span
						class="link-span"
						role="presentation"
						onclick={() => (isSignUp = false)}>accedi</span
					>
				{:else}
					<span
						class="link-span"
						role="presentation"
						onclick={() => (isSignUp = true)}>crea account</span
					>
				{/if}
			</div>
		</div>

		<p class="footer-hint">Accedendo accetti i Termini di servizio.</p>
	</div>
</div>

<style>
	.link-span {
		text-decoration: underline;
		cursor: pointer;
	}

	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem var(--page-padding);
	}

	.wrapper {
		width: 100%;
		max-width: 340px;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* ── Brand ── */
	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
	}

	.brand-icon {
		width: 56px;
		height: 56px;
		border-radius: 16px;
		background: var(--color-accent-dim);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.6rem;
	}

	.brand-icon i {
		font-size: 26px;
		color: var(--color-accent);
	}

	.brand-name {
		margin: 0;
		font-size: 1.9rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--color-text);
		line-height: 1.1;
	}

	.brand-sub {
		margin: 0;
		font-size: 0.85rem;
		color: var(--color-muted);
	}

	/* ── Form stack — no card, fields float on the bg ── */
	.form-stack {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	label {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-muted);
	}

	input {
		font-family: var(--font-sans);
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--color-text);
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 0.8rem 0.9rem;
		width: 100%;
		outline: none;
		box-sizing: border-box;
		box-shadow: var(--shadow-card);
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		-webkit-appearance: none;
	}

	input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-accent-dim);
	}

	input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	input::placeholder {
		color: var(--color-muted);
		font-weight: 400;
	}

	/* ── Password toggle ── */
	.password-wrap {
		position: relative;
	}

	.password-wrap input {
		padding-right: 2.75rem;
	}

	.eye-btn {
		position: absolute;
		right: 0.7rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		padding: 0.2rem;
		cursor: pointer;
		color: var(--color-muted);
		display: flex;
		align-items: center;
		border-radius: 6px;
	}

	.eye-btn i {
		font-size: 17px;
	}

	/* ── Error ── */
	.error {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-danger);
		text-align: center;
	}

	/* ── Buttons ── */
	.btn-login {
		width: 100%;
		font-size: 0.95rem;
		padding: 0.8rem 1rem;
		border-radius: 12px;
		margin-top: 0.25rem;
	}

	/* ── Divider ── */
	.divider {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0.1rem 0;
	}

	.divider::before,
	.divider::after {
		content: "";
		flex: 1;
		height: 1px;
		background: var(--color-border);
	}

	.divider span {
		font-size: 0.75rem;
		color: var(--color-muted);
		white-space: nowrap;
	}

	/* ── Footer ── */
	.footer-hint {
		margin: 0;
		text-align: center;
		font-size: 0.75rem;
		color: var(--color-muted);
	}
</style>
