<script lang="ts">
	import { resolve } from "$app/paths";
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import CelebrationOverlay from "$lib/components/CelebrationOverlay.svelte";
	import type { Exercise } from "$lib/types";
	import { goto } from "$app/navigation";
	import posthog from "posthog-js";
	import Icon from "$lib/components/Icon.svelte";

	type SessionExercise = {
		id: string;
		name: string;
		icon?: string;
		step_label?: string;
		checked: boolean;
	};

	let quickExercises = $derived(
		($exercises ?? [])
			.filter((ex) => ex.type === "quick-exercise")
			.map((ex) => ({
				...ex,
				checked: true,
			})),
	);

	let program = $derived(
		($exercises ?? [])
			.filter((ex) => {
				if (ex.type !== "exercise" || !ex.steps) return false;
				const currentIndex = ex.current_step_index ?? 0;
				return currentIndex < ex.steps.length;
			})
			.map((ex) => ({
				id: ex.id,
				name: ex.name,
				step_label: ex.steps?.[ex.current_step_index ?? 0]?.description ?? "—",
				checked: true,
			})),
	);

	let selectedQuick = $state<Map<string, SessionExercise>>(new Map());
	let selectedExercises = $state<Map<string, SessionExercise>>(new Map());
	let celebrating = $state(false);

	async function logSession() {
		let snapshot: Exercise[] = [];

		selectedExercises.forEach((val) => {
			snapshot.push({ id: val.id, name: val.name, type: "exercise" });
		});
		selectedQuick.forEach((val) => {
			snapshot.push({ id: val.id, name: val.name, type: "quick-exercise" });
		});

		await sessions.logSession(snapshot);
		celebrating = true;

		posthog.capture("session_logged", {
			exercise_count: selectedExercises.size,
			quick_exercise_count: selectedQuick.size,
			total_exercises: snapshot.length,
		});

		goto(resolve("/home"));
	}

	function toggleQuick(qEx: SessionExercise) {
		if (selectedQuick.has(qEx.id)) {
			selectedQuick.delete(qEx.id);
		} else {
			selectedQuick.set(qEx.id, qEx);
		}

		selectedQuick = new Map(selectedQuick.entries());
	}

	function toggleExercise(ex: SessionExercise) {
		if (selectedExercises.has(ex.id)) {
			selectedExercises.delete(ex.id);
		} else {
			selectedExercises.set(ex.id, ex);
		}

		selectedExercises = new Map(selectedExercises.entries());
	}
</script>

<CelebrationOverlay
	visible={celebrating}
	onDone={() => (celebrating = false)}
/>

<div class="training-page">
	<a href={resolve("/home")} class="nav-back">
		<Icon name="chevron-left" size={24} />
		Home
	</a>
	<h1 class="large-title page-title">Registra sessione</h1>

	<div class="training-layout">
		<section class="col-program">
			<header class="col-header">
				<div>
					<h2 class="ios-section-label">Programma attuale</h2>
					<p class="col-sub">{program.length} esercizi</p>
				</div>
			</header>

			<ol class="program-list ios-card">
				{#each program as item (item.id)}
					<li
						class="program-item"
						class:active={selectedExercises.has(item.id)}
					>
						<div
							role="presentation"
							class="program-link"
							onclick={() => toggleExercise(item)}
						>
							<div class="row-left">
								<span class="ex-name">{item.name}</span>
								<span class="ex-step">{item.step_label}</span>
							</div>
							<Icon name="chevron-right" size={16} class="chevron-arrow" />
						</div>
					</li>
				{/each}
			</ol>
		</section>

		{#if quickExercises && quickExercises.length > 0}
			<section class="quick-section">
				<p class="quick-label">Esercizi rapidi</p>
				<div class="quick-grid">
					{#each quickExercises as ex (ex.id)}
						<button
							class="quick-box"
							class:active={selectedQuick.has(ex.id)}
							onclick={() => toggleQuick(ex)}
							aria-pressed={selectedQuick.has(ex.id)}
						>
							<span class="quick-icon" aria-hidden="true">{ex.icon}</span>
							<span class="quick-label-text">{ex.name}</span>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Spacer so content doesn't hide behind the fixed bar -->
		<div class="action-spacer" aria-hidden="true"></div>
	</div>
</div>

<!-- Fixed bottom action bar -->
<div class="action-bar">
	<button
		class="btn btn-log"
		onclick={logSession}
		disabled={(selectedExercises.size === 0 && selectedQuick.size === 0) || celebrating}
	>
		Registra sessione
	</button>
</div>

<style>
	.training-page {
		max-width: 600px;
		margin: 0 auto;
		width: 100%;
	}	.page-title {
		margin: 0 0 1.25rem;
		padding: 0 1rem;
	}

	.training-layout {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Pushes content above the fixed bar height + a little breathing room */
	.action-spacer {
		height: calc(4.5rem + env(safe-area-inset-bottom, 0px));
	}

	.col-header {
		margin-bottom: 0.5rem;
	}

	.col-sub {
		margin: 0.25rem 0 0;
		font-size: 13px;
		color: var(--color-muted);
	}

	/* Program list */
	.program-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	.program-item {
		border-bottom: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		transition: background 0.15s ease, color 0.15s ease;
	}

	.program-item:last-child {
		border-bottom: none;
	}

	.program-link {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
	}

	.row-left {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		align-items: flex-start;
		flex: 1;
		min-width: 0;
	}

	.ex-name {
		font-size: 17px;
		font-weight: 600;
		color: inherit;
		white-space: normal;
		word-wrap: break-word;
	}

	.ex-step {
		font-size: 13px;
		color: var(--color-muted);
		text-align: left;
	}

	:global(.chevron-arrow) {
		color: var(--color-muted);
		opacity: 0.5;
		flex-shrink: 0;
		margin-left: 0.5rem;
	}

	/* Quick section */
	.quick-section {
		width: 100%;
	}

	.quick-label {
		margin: 0 0 1rem;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.8px;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.quick-grid {
		display: grid;
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
		border-radius: 16px;
		border: 1px solid var(--color-border);
		background: var(--color-card);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.quick-box:hover {
		background: var(--color-track);
	}

	.program-item.active,
	.quick-box.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: #ffffff;
	}

	.program-item.active .ex-step,
	.program-item.active :global(.chevron-arrow) {
		color: rgba(255, 255, 255, 0.85);
	}

	.quick-icon {
		font-size: 1.5rem;
		line-height: 1;
	}

	.quick-label-text {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-text);
		text-align: center;
		line-height: 1.2;
		transition: color 0.15s ease;
	}

	.quick-box.active .quick-label-text {
		color: #ffffff;
	}

	/* ── Fixed bottom action bar ── */
	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
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
		height: calc(100% + 2rem);
		z-index: -1;
		pointer-events: none;
		backdrop-filter: blur(20px) saturate(1.8);
		-webkit-backdrop-filter: blur(20px) saturate(1.8);
		mask-image: linear-gradient(to bottom, transparent 0%, black 60%);
		-webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 60%);
		background: linear-gradient(
			to bottom,
			transparent 0%,
			var(--color-tab-bar) 100%
		);
	}

	.btn-log {
		width: 100%;
		height: 52px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: 600;
		border-radius: 14px;
		background-color: var(--color-accent);
		color: white;
		border: none;
		cursor: pointer;
		transition: opacity 150ms ease, transform 150ms ease;
	}

	.btn-log:active:not(:disabled) {
		opacity: 0.9;
		transform: scale(0.985);
	}

	.btn-log:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Desktop */
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
