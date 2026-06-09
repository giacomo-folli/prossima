<script lang="ts">
	import { resolve } from "$app/paths";
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import CelebrationOverlay from "$lib/components/CelebrationOverlay.svelte";
	import type { Exercise } from "$lib/types";
	import { ExerciseType } from "$lib/constants";
	import { goto } from "$app/navigation";
	import posthog from "posthog-js";
	import Icon from "$lib/components/Icon.svelte";
	import { onDestroy } from "svelte";

	interface LogSetState {
		set_index: number;
		completed: boolean;
		reps: number;
		label: string;
	}

	interface LoggingExercise {
		id: string;
		name: string;
		step_label: string;
		sets: LogSetState[];
		expanded: boolean;
		type: ExerciseType;
	}

	interface LoggingQuick {
		id: string;
		name: string;
		icon?: string;
		checked: boolean;
		type: ExerciseType;
	}

	function parseSetsAndReps(description: string): { sets: number; reps: number; label: string } {
		const cleanDesc = description.includes(":") ? description.split(":").slice(1).join(":").trim() : description;

		const match = cleanDesc.match(/(\d+)\s*(?:serie da|serie|x|da|sets of)\s*(.+)$/i);
		if (match) {
			const sets = parseInt(match[1]);
			const label = match[2].trim();
			const repsMatch = label.match(/^(\d+)/);
			const reps = repsMatch ? parseInt(repsMatch[1]) : 10;
			return { sets, reps, label };
		}
		const singleMatch = cleanDesc.match(/(\d+)\s*(?:reps|rep|sec|s)(.*)$/i);
		if (singleMatch) {
			const label = singleMatch[0].trim();
			const reps = parseInt(singleMatch[1]);
			return { sets: 1, reps, label };
		}
		return { sets: 3, reps: 10, label: "10 rep" };
	}

	let localExercises = $state<LoggingExercise[]>([]);
	let localQuick = $state<LoggingQuick[]>([]);
	let celebrating = $state(false);

	const unsubscribe = exercises.subscribe((storeExercises) => {
		if (!storeExercises) return;

		// 1. Sync Program Exercises
		const currentProgram = storeExercises.filter((ex) => {
			if (ex.type !== ExerciseType.EXERCISE || !ex.steps) return false;
			const currentIndex = ex.current_step_index ?? 0;
			return currentIndex < ex.steps.length;
		});

		localExercises = currentProgram.map((ex) => {
			const existing = localExercises.find((le) => le.id === ex.id);
			const step_label = ex.steps?.[ex.current_step_index ?? 0]?.description ?? "—";
			const parsed = parseSetsAndReps(step_label);

			let sets: LogSetState[] = [];
			if (existing && existing.step_label === step_label && existing.sets.length === parsed.sets) {
				sets = existing.sets;
			} else {
				for (let i = 0; i < parsed.sets; i++) {
					sets.push({
						set_index: i,
						completed: false,
						reps: parsed.reps,
						label: parsed.label
					});
				}
			}

			return {
				id: ex.id,
				name: ex.name,
				step_label,
				sets,
				expanded: existing ? existing.expanded : false,
				type: ExerciseType.EXERCISE
			};
		});

		// 2. Sync Quick Exercises
		const currentQuick = storeExercises.filter((ex) => ex.type === ExerciseType.QUICK_EXERCISE);
		localQuick = currentQuick.map((ex) => {
			const existing = localQuick.find((lq) => lq.id === ex.id);
			return {
				id: ex.id,
				name: ex.name,
				icon: ex.icon,
				checked: existing ? existing.checked : false,
				type: ExerciseType.QUICK_EXERCISE
			};
		});
	});

	onDestroy(unsubscribe);

	// Progress Calculations
	const totalSets = $derived(localExercises.reduce((sum, ex) => sum + ex.sets.length, 0));
	const completedSetsCount = $derived(localExercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0));

	const totalQuick = $derived(localQuick.length);
	const completedQuickCount = $derived(localQuick.filter((q) => q.checked).length);

	const totalUnits = $derived(totalSets + totalQuick);
	const completedUnits = $derived(completedSetsCount + completedQuickCount);

	const progressPct = $derived(totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100));

	async function logSession() {
		let snapshot: Exercise[] = [];

		localExercises.forEach((ex) => {
			const completedSets = ex.sets.filter((s) => s.completed);
			if (completedSets.length > 0) {
				snapshot.push({
					id: ex.id,
					name: ex.name,
					type: ExerciseType.EXERCISE,
					logged_sets: ex.sets.map((s) => ({
						set_index: s.set_index,
						completed: s.completed,
						reps: s.reps
					}))
				});
			}
		});

		localQuick.forEach((ex) => {
			if (ex.checked) {
				snapshot.push({
					id: ex.id,
					name: ex.name,
					icon: ex.icon,
					type: ExerciseType.QUICK_EXERCISE
				});
			}
		});

		await sessions.logSession(snapshot);
		celebrating = true;

		posthog.capture("session_logged", {
			exercise_count: snapshot.filter((e) => e.type === ExerciseType.EXERCISE).length,
			quick_exercise_count: snapshot.filter((e) => e.type === ExerciseType.QUICK_EXERCISE).length,
			total_exercises: snapshot.length,
		});

		goto(resolve("/home"));
	}
</script>

<CelebrationOverlay
	visible={celebrating}
	onDone={() => (celebrating = false)}
/>

<div class="training-page">
	<div class="header-container">
		<div>
			<a href={resolve("/home")} class="nav-back">
				<Icon name="chevron-left" size={24} />
				Home
			</a>
			<h1 class="large-title page-title">Registra sessione</h1>
		</div>
		<div class="header-ring-wrapper">
			<svg class="progress-ring" width="80" height="80" viewBox="0 0 80 80">
				<defs>
					<linearGradient id="progress-grad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stop-color="#10b981" />
						<stop offset="100%" stop-color="#14b8a6" />
					</linearGradient>
				</defs>
				<circle class="progress-ring-track" cx="40" cy="40" r="34" stroke="var(--color-border, #3a3a3c)" stroke-width="6" fill="transparent" />
				<circle class="progress-ring-fill" cx="40" cy="40" r="34" stroke="url(#progress-grad)" stroke-width="6" fill="transparent"
						stroke-dasharray="213.63" stroke-dashoffset={213.63 - (213.63 * progressPct) / 100}
						stroke-linecap="round" transform="rotate(-90 40 40)" />
				<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" class="progress-ring-text">
					{progressPct}%
				</text>
			</svg>
		</div>
	</div>

	<div class="training-layout">
		<section class="col-program">
			<header class="col-header">
				<div>
					<h2 class="ios-section-label">Programma attuale</h2>
					<p class="col-sub">{localExercises.length} esercizi</p>
				</div>
			</header>

			<ol class="program-list ios-card">
				{#each localExercises as item (item.id)}
					<li
						class="program-item-wrapper"
						class:active={item.sets.some(s => s.completed)}
						class:completed={item.sets.every(s => s.completed)}
						class:partial={item.sets.some(s => s.completed) && !item.sets.every(s => s.completed)}
					>
						<div
							role="presentation"
							class="program-link"
							onclick={() => item.expanded = !item.expanded}
						>
							<div class="row-left">
								<span class="ex-name">{item.name}</span>
								<span class="ex-step">{item.step_label}</span>
							</div>
							<div class="row-right-actions">
								<button
									type="button"
									class="quick-complete-btn"
									onclick={(e) => {
										e.stopPropagation();
										const allDone = item.sets.every(s => s.completed);
										item.sets.forEach(s => s.completed = !allDone);
									}}
									aria-label={item.sets.every(s => s.completed) ? "Segna come incompleto" : "Segna tutti come completati"}
								>
									<Icon
										name={item.sets.every(s => s.completed) ? "circle-check" : "circle"}
										size={22}
										class="quick-complete-icon {item.sets.every(s => s.completed) ? 'completed' : ''}"
									/>
								</button>
								<span class="sets-badge" class:all-completed={item.sets.every(s => s.completed)} class:has-completed={item.sets.some(s => s.completed)}>
									{item.sets.filter(s => s.completed).length}/{item.sets.length}
								</span>
								<Icon name={item.expanded ? "chevron-up" : "chevron-down"} size={16} class="chevron-arrow" />
							</div>
						</div>

						{#if item.expanded}
							<div class="set-drawer-container">
								<div class="set-drawer">
									{#each item.sets as set, idx (idx)}
										<div class="set-row">
											<span class="set-number">Set {idx + 1}</span>
											<span class="set-reps">{set.label}</span>
											<button
												type="button"
												class="set-checkbox-btn"
												onclick={() => set.completed = !set.completed}
												aria-label="Segna set {idx + 1} completato"
											>
												<div class="tactile-checkbox" class:checked={set.completed}>
													{#if set.completed}
														<Icon name="check" size={16} class="checkbox-checkmark" />
													{/if}
												</div>
											</button>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</li>
				{/each}
			</ol>
		</section>

		{#if localQuick && localQuick.length > 0}
			<section class="quick-section">
				<p class="quick-label">Esercizi rapidi</p>
				<div class="quick-grid">
					{#each localQuick as ex (ex.id)}
						<button
							class="quick-box"
							class:active={ex.checked}
							onclick={() => ex.checked = !ex.checked}
							aria-pressed={ex.checked}
						>
							{#if ex.icon}
								<span class="quick-icon" aria-hidden="true">{ex.icon}</span>
							{:else}
								<Icon name="bolt" size={16} class="quick-icon-fallback" />
							{/if}
							<span class="quick-label-text">{ex.name}</span>
						</button>
					{/each}
				</div>
			</section>
		{/if}

		<div class="action-spacer" aria-hidden="true"></div>
	</div>
</div>

<div class="action-bar">
	<button
		class="btn btn-log"
		onclick={logSession}
		disabled={completedUnits === 0 || celebrating}
	>
		Registra sessione
	</button>
</div>

<style>
	.training-page {
		max-width: 600px;
		margin: 0 auto;
		width: 100%;
		padding-top: 1rem;
	}

	.page-title {
		margin: 0;
		padding: 0;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding: 0 0.5rem;
	}

	.header-ring-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* Circular Progress Ring */
	.progress-ring {
		display: block;
	}

	.progress-ring-track {
		stroke: var(--color-border, #2c2c2e);
	}

	.progress-ring-fill {
		transition: stroke-dashoffset 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.progress-ring-text {
		font-size: 16px;
		font-weight: 700;
		fill: var(--color-text, #ffffff);
		font-family: var(--font-sans);
	}

	.training-layout {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
		padding: 0;
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

	.program-item-wrapper {
		border-bottom: 1px solid var(--color-border);
		border-left: 3px solid transparent;
		display: flex;
		flex-direction: column;
		transition: all 0.2s ease;
	}

	.program-item-wrapper.partial {
		background: rgba(20, 184, 166, 0.02);
		border-left: 3px solid #20b8a6;
	}

	:global(html.dark) .program-item-wrapper.partial {
		background: rgba(20, 184, 166, 0.04);
	}

	.program-item-wrapper.completed {
		background: rgba(16, 185, 129, 0.03);
		opacity: 0.65;
		border-left: 3px solid #10b981;
	}

	:global(html.dark) .program-item-wrapper.completed {
		background: rgba(16, 185, 129, 0.05);
	}

	.quick-complete-btn {
		background: none;
		border: none;
		padding: 0.3rem;
		margin: -0.3rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		outline: none;
		opacity: 0.6;
		transition: opacity 0.2s ease, transform 0.15s ease;
	}

	.quick-complete-btn:hover {
		opacity: 1;
		transform: scale(1.1);
	}

	.quick-complete-btn:active {
		transform: scale(0.9);
	}

	:global(.quick-complete-icon) {
		color: var(--color-muted);
		opacity: 0.5;
		transition: color 0.2s ease, opacity 0.2s ease;
	}

	:global(.quick-complete-icon.completed) {
		color: #10b981 !important;
		opacity: 1;
	}

	.program-item-wrapper:last-child {
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

	.row-right-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
		margin-left: 0.5rem;
	}

	/* Sets badge count indicator */
	.sets-badge {
		font-size: 12px;
		font-weight: 700;
		padding: 3px 8px;
		border-radius: 20px;
		background: var(--color-track, #2c2c2e);
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		border: 1px solid var(--color-border);
		transition: all 0.2s ease;
	}

	.sets-badge.has-completed {
		background: rgba(16, 185, 129, 0.1);
		color: #10b981;
		border-color: rgba(16, 185, 129, 0.25);
	}

	.sets-badge.all-completed {
		background: #10b981;
		color: #ffffff;
		border-color: #10b981;
	}

	:global(.chevron-arrow) {
		color: var(--color-muted);
		opacity: 0.5;
		flex-shrink: 0;
	}

	/* Glassmorphic Set Drawer */
	.set-drawer-container {
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-top: 1px solid var(--color-border);
		width: 100%;
		overflow: hidden;
		animation: slideDown 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	:global(html.dark) .set-drawer-container {
		background: rgba(28, 28, 30, 0.45);
	}

	@keyframes slideDown {
		from {
			max-height: 0;
			opacity: 0;
		}
		to {
			max-height: 350px;
			opacity: 1;
		}
	}

	.set-drawer {
		padding: 0.5rem 1.25rem;
		display: flex;
		flex-direction: column;
	}

	.set-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.65rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.03);
	}

	.set-row:last-child {
		border-bottom: none;
	}

	.set-number {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text);
	}

	.set-reps {
		font-size: 14px;
		color: var(--color-muted);
		flex: 1;
		margin-left: 2rem;
	}

	/* Checkbox Button & Tactile Checkbox animations */
	.set-checkbox-btn {
		background: none;
		border: none;
		padding: 0.5rem;
		margin: -0.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		outline: none;
	}

	.tactile-checkbox {
		width: 24px;
		height: 24px;
		border-radius: 8px;
		border: 2px solid var(--color-border, #3a3a3c);
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.1s ease;
	}

	.tactile-checkbox.checked {
		border-color: var(--color-accent, #10b981);
		background-color: var(--color-accent, #10b981);
		animation: checkboxPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.tactile-checkbox:active {
		transform: scale(0.85);
	}

	:global(.checkbox-checkmark) {
		color: #ffffff;
		animation: checkmarkBounce 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	@keyframes checkboxPop {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.25);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes checkmarkBounce {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.3);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
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

	.quick-box.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: #ffffff;
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
		transition:
			opacity 150ms ease,
			transform 150ms ease;
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
