<script lang="ts">
	import { resolve } from "$app/paths";
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import type { QuickExercise, SessionExercise } from "$lib/types";
	import CelebrationOverlay from "$lib/components/CelebrationOverlay.svelte";
	import { quickExercises } from "$lib/stores/quickExercises";
	import SessionHistory from "$lib/components/SessionHistory.svelte";

	let program = $derived(
		$exercises
			.filter((ex) => ex.currentStepIndex < ex.steps.length)
			.map((ex) => ({
				exerciseId: ex.id,
				exerciseName: ex.name,
				stepLabel: ex.steps[ex.currentStepIndex]?.description ?? "—",
				checked: true,
			})),
	);

	let selectedQuick = $state<Map<string, QuickExercise>>(new Map());
	let celebrating = $state(false);

	function logSession() {
		if (program.length === 0) return;
		const snapshot: SessionExercise[] = program
			.filter((ex) => ex.checked)
			.map((p) => {
				const { checked, ...rest } = p;
				return { ...rest, type: "exercise" };
			});

		selectedQuick.forEach((val) => {
			snapshot.push({
				exerciseId: val.id,
				exerciseName: val.label,
				type: "quick-exeercise",
			});
		});

		sessions.logSession(snapshot);
		celebrating = true;
	}

	function toggleQuick(qEx: QuickExercise) {
		if (selectedQuick.has(qEx.id)) {
			selectedQuick.delete(qEx.id);
		} else {
			selectedQuick.set(qEx.id, qEx);
		}

		selectedQuick = new Map(selectedQuick.entries());
	}
</script>

<CelebrationOverlay
	visible={celebrating}
	onDone={() => (celebrating = false)}
/>

<div class="training-layout">
	<section class="col-program">
		<header class="col-header">
			<div>
				<h2>Programma attuale</h2>
				<p class="col-sub">{program.length} esercizi</p>
			</div>
		</header>

		<ol class="program-list">
			{#each program as item (item.exerciseId)}
				<li class="program-item">
					<a
						href={resolve(`/exercises/${item.exerciseId}`)}
						class="program-link"
					>
						<span class="ex-name">{item.exerciseName}</span>
						<span class="ex-step">{item.stepLabel}</span>
					</a>

					<input
						type="checkbox"
						id={item.exerciseId}
						bind:checked={item.checked}
					/>
				</li>
			{/each}
		</ol>
	</section>

	{#if $quickExercises && $quickExercises.length > 0}
		<section class="quick-section">
			<p class="quick-label">Esercizi rapidi</p>
			<div class="quick-grid">
				{#each $quickExercises as ex (ex.id)}
					<button
						class="quick-box"
						class:active={selectedQuick.has(ex.id)}
						onclick={() => toggleQuick(ex)}
						aria-pressed={selectedQuick.has(ex.id)}
					>
						<span class="quick-icon" aria-hidden="true">{ex.icon}</span>
						<span class="quick-label-text">{ex.label}</span>
					</button>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Spacer so content doesn't hide behind the fixed bar -->
	<div class="action-spacer" aria-hidden="true"></div>
</div>

<!-- Fixed bottom action bar -->
<div class="action-bar">
	<button
		class="btn btn--primary btn-log"
		onclick={logSession}
		disabled={program.length === 0 || celebrating}
	>
		Registra sessione
	</button>
</div>

<style>
	.training-layout {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		width: 100%;
		/* Mobile-first: full width with comfortable padding */
		padding: 0 1rem 0;
		/* Desktop: constrain and centre */
		max-width: 600px;
		margin: 0 auto;
	}

	/* Pushes content above the fixed bar height + a little breathing room */
	.action-spacer {
		height: calc(4.5rem + env(safe-area-inset-bottom, 0px));
	}

	.col-header {
		margin-bottom: 1rem;
	}

	h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--color-text);
	}

	.col-sub {
		margin: 0.25rem 0 0;
		font-size: 0.875rem;
		color: var(--color-muted);
	}

	/* Program list */
	.program-list {
		list-style: none;
		margin: 0;
		padding: 0;
		background: var(--color-card, #1c1c1e);
		border: 1px solid var(--color-border, #2c2c2e);
		border-radius: 12px;
		overflow: hidden;
	}

	.program-item {
		border-bottom: 1px solid var(--color-border, #2c2c2e);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 1.25rem;
	}

	.program-item:last-child {
		border-bottom: none;
	}

	input[type="checkbox"] {
		width: 1.5rem;
		height: 1.5rem;
		min-width: 1.5rem;
		min-height: 1.5rem;
		accent-color: var(--color-accent, #2c974b);
		cursor: pointer;
		border-radius: 4px;
	}

	.program-link {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		gap: 0.35rem;
		padding: 1rem 1.25rem;
		text-decoration: none;
		color: inherit;
		transition: background 0.15s ease;
	}

	.program-link:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.ex-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
		white-space: normal;
		word-wrap: break-word;
	}

	.ex-step {
		font-size: 0.85rem;
		color: var(--color-muted);
		text-align: left;
	}

	/* Quick section */
	.quick-section {
		width: 100%;
	}

	.quick-label {
		margin: 0 0 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.quick-grid {
		display: grid;
		/* Mobile-first: exactly 3 columns */
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	.quick-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem 0.5rem;
		border-radius: 12px;
		border: 1px solid var(--color-border, #2c2c2e);
		background: var(--color-card, #1c1c1e);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.quick-box:hover {
		background: var(--color-track, #2c2c2e);
	}

	.quick-box.active {
		background: var(--color-accent, #2c974b);
		border-color: var(--color-accent, #2c974b);
	}

	.quick-box.active .quick-label-text {
		color: #ffffff;
	}

	.quick-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.quick-label-text {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-text);
		text-align: center;
		line-height: 1.2;
	}

	/* ── Fixed bottom action bar ── */
	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;

		/* Respect notches / home indicators on iOS */
		padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));

		display: flex;
		justify-content: stretch;
	}

	/* ── Progressive Blur Background ── */
	.action-bar::before {
		content: "";
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;

		/* Extend the blur box a few rems above the actual container */
		height: calc(100% + 2rem);
		z-index: -1;

		/* Prevent the extended background from blocking clicks on elements beneath it */
		pointer-events: none;

		/* The actual blur effect */
		backdrop-filter: blur(10px) saturate(1.4);
		-webkit-backdrop-filter: blur(10px) saturate(1.4);

		/* Use a mask to fade the blur: transparent at the top, solid black (fully visible) at the bottom */
		mask-image: linear-gradient(to bottom, transparent 0%, black 60%);
		-webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 60%);

		/* Add a subtle dark gradient to match your app's theme (using your var(--color-card) base) */
		background: linear-gradient(
			to bottom,
			transparent 0%,
			rgba(28, 28, 30, 0.3) 100%
		);
	}

	.btn-log {
		/* Full width inside the bar on mobile */
		width: 100%;
		padding: 0.875rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		border-radius: 8px;
		background-color: var(--color-accent, #2c974b);
		color: white;
		border: none;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-log:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Desktop: centre-align the bar content to match the page max-width */
	@media (min-width: 600px) {
		.action-bar {
			justify-content: center;
		}

		.btn-log {
			width: 600px;
			max-width: 100%;
		}

		.quick-grid {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		}
	}
</style>
