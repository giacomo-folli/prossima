<script lang="ts">
	import { resolve } from "$app/paths";
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import type { SessionExercise } from "$lib/types";
	import CelebrationOverlay from "$lib/components/CelebrationOverlay.svelte";

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

	let celebrating = $state(false);

	function logSession() {
		if (program.length === 0) return;
		const snapshot: SessionExercise[] = program
			.filter((ex) => ex.checked)
			.map((p) => {
				const { checked, ...rest } = p;
				return rest;
			});

		sessions.logSession(snapshot);
		celebrating = true;
	}

	const quickExercises = [
		{ id: "yoga", icon: "🧘", label: "Yoga" },
		{ id: "stretching", icon: "🤸", label: "Stretching" },
		{ id: "fisio", icon: "🦶🏼", label: "Esercizi per caviglia" },
	];

	let selectedQuick = $state<Set<string>>(new Set());

	function toggleQuick(id: string) {
		selectedQuick = new Set(
			selectedQuick.has(id)
				? [...selectedQuick].filter((x) => x !== id)
				: [...selectedQuick, id],
		);
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

	<section class="quick-section">
		<p class="quick-label">Esercizi rapidi</p>
		<div class="quick-grid">
			{#each quickExercises as ex (ex.id)}
				<button
					class="quick-box"
					class:active={selectedQuick.has(ex.id)}
					onclick={() => toggleQuick(ex.id)}
					aria-pressed={selectedQuick.has(ex.id)}
				>
					<span class="quick-icon" aria-hidden="true">{ex.icon}</span>
					<span class="quick-label-text">{ex.label}</span>
				</button>
			{/each}
		</div>
	</section>

	<section class="action-section">
		<button
			class="btn btn--primary btn-log"
			onclick={logSession}
			disabled={program.length === 0 || celebrating}
		>
			Registra sessione
		</button>
	</section>
</div>

<style>
	.training-layout {
		display: flex;
		flex-direction: column;
		gap: 2rem; /* Consistent spacing between major sections */
		max-width: 600px; /* Constrain width for better readability on desktop */
		width: 100%;
		margin: 0 auto;
		padding-bottom: 2rem;
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
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
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

	/* Action section */
	.action-section {
		width: 100%;
		display: flex;
		justify-content: flex-start;
	}

	.btn-log {
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

	/* Mobile adjustments */
	@media (max-width: 480px) {
		.quick-grid {
			grid-template-columns: repeat(
				3,
				1fr
			); /* Forces exactly 3 columns on small screens */
		}

		.btn-log {
			width: 100%; /* Make button full width on mobile */
		}
	}
</style>
