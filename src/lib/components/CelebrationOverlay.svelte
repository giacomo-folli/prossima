<script lang="ts">
	let { visible = false, onDone }: { visible?: boolean; onDone?: () => void } = $props();

	const quotes = [
		"La costanza batte il talento ogni volta.",
		"Ogni rep conta. Ogni sessione costruisce.",
		"Il tuo futuro self ti ringrazia.",
		"Non fermarti — stai costruendo qualcosa di grande.",
		"Disciplina è libertà. Continua così.",
		"Progressi, non perfezione.",
	];

	let quote = $state("");
	let dismissed = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (visible) {
			dismissed = false;
			quote = quotes[Math.floor(Math.random() * quotes.length)];
			clearTimeout(timer);
			timer = setTimeout(dismiss, 5000);
		}
	});

	function dismiss() {
		dismissed = true;
		clearTimeout(timer);
		setTimeout(() => {
			onDone?.();
		}, 400);
	}
</script>

{#if visible}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="overlay" class:dismissed onclick={dismiss}>
		<div class="card" class:dismissed onclick={(e) => e.stopPropagation()}>

			<!-- Animated progress ring -->
			<div class="ring-wrap" aria-hidden="true">
				<svg class="ring-svg" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="40" cy="40" r="34" stroke="var(--color-track)" stroke-width="5"/>
					<circle
						cx="40" cy="40" r="34"
						stroke="var(--color-accent)"
						stroke-width="5"
						stroke-linecap="round"
						stroke-dasharray="213.6"
						stroke-dashoffset="213.6"
						class="ring-progress"
						transform="rotate(-90 40 40)"
					/>
				</svg>
				<span class="ring-emoji">💪</span>
			</div>

			<p class="eyebrow">Sessione completata</p>
			<h2 class="headline">Ottimo lavoro!</h2>
			<p class="motivational">"{quote}"</p>

			<button class="btn btn--primary dismiss-btn" onclick={dismiss}>
				Continua
			</button>
		</div>
	</div>
{/if}

<style>
	/* ── Backdrop ── */
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-overlay);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		animation: fadeIn 0.25s ease both;
		padding: 1.5rem;
	}

	.overlay.dismissed {
		animation: fadeOut 0.35s ease both;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to   { opacity: 1; }
	}

	@keyframes fadeOut {
		from { opacity: 1; }
		to   { opacity: 0; }
	}

	/* ── Card ── */
	.card {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 16px;
		padding: 2.5rem 2rem 2rem;
		max-width: 340px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		box-shadow: var(--shadow-elevated);
		animation: cardUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
	}

	.card.dismissed {
		animation: cardDown 0.3s ease both;
	}

	@keyframes cardUp {
		from { opacity: 0; transform: translateY(20px) scale(0.97); }
		to   { opacity: 1; transform: translateY(0) scale(1); }
	}

	@keyframes cardDown {
		from { opacity: 1; transform: translateY(0) scale(1); }
		to   { opacity: 0; transform: translateY(12px) scale(0.97); }
	}

	/* ── Ring ── */
	.ring-wrap {
		position: relative;
		width: 80px;
		height: 80px;
		margin-bottom: 1.5rem;
		flex-shrink: 0;
	}

	.ring-svg {
		width: 80px;
		height: 80px;
	}

	.ring-progress {
		animation: drawRing 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
	}

	@keyframes drawRing {
		from { stroke-dashoffset: 213.6; }
		to   { stroke-dashoffset: 0; }
	}

	.ring-emoji {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.85s both;
	}

	@keyframes popIn {
		from { opacity: 0; transform: scale(0.5); }
		to   { opacity: 1; transform: scale(1); }
	}

	/* ── Type ── */
	.eyebrow {
		margin: 0 0 0.4rem;
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-accent);
		animation: fadeSlideUp 0.4s ease 0.3s both;
	}

	.headline {
		margin: 0 0 0.75rem;
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--color-text);
		line-height: 1.1;
		animation: fadeSlideUp 0.4s ease 0.4s both;
	}

	.motivational {
		margin: 0 0 1.75rem;
		font-size: 0.85rem;
		line-height: 1.55;
		color: var(--color-muted);
		max-width: 260px;
		animation: fadeSlideUp 0.4s ease 0.5s both;
	}

	@keyframes fadeSlideUp {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	/* ── Button ── */
	.dismiss-btn {
		width: 100%;
		height: 52px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: 600;
		border-radius: 14px;
		transition: opacity 150ms ease, transform 150ms ease;
		animation: fadeSlideUp 0.4s ease 0.6s both;
	}

	.dismiss-btn:active {
		opacity: 0.9;
		transform: scale(0.985);
	}
</style>