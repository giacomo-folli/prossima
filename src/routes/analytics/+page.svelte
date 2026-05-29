<script lang="ts">
	import { resolve } from "$app/paths";
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";

	const filteredExercises = $derived(
		$exercises.filter((e) => e.type === "exercise"),
	);

	// ─── overall exercise completion ───────────────────────────────────────────
	const totalSteps = $derived(
		filteredExercises.reduce((s, ex) => s + Number(ex.steps?.length), 0),
	);
	const completedSteps = $derived(
		filteredExercises.reduce(
			(s, ex) => s + Number(ex.steps?.filter((st) => st.completed)?.length),
			0,
		),
	);
	const overallPct = $derived(
		totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100),
	);

	const exercisesInCourse = $derived(
		filteredExercises.filter(ex => {
			const done = ex.steps?.filter(s => s.completed).length ?? 0;
			const total = ex.steps?.length ?? 0;
			return total > 0 && done < total;
		}).length
	);

	// ─── per-exercise stats ────────────────────────────────────────────────────
	const exerciseStats = $derived(
		filteredExercises
			.filter(ex => (ex.steps?.length ?? 0) > 0)
			.map((ex) => {
				const done = ex.steps?.filter((s) => s.completed).length ?? 0;
				const total = ex.steps?.length ?? 0;
				const pct = total === 0 ? 0 : Math.round((done / total) * 100);

				// Find last time performed
				const performedSessions = $sessions.filter((s) =>
					s.exercises.some((e) => e.id === ex.id),
				);
				
				let lastSessionDate: Date | null = null;
				let daysSinceLast = Infinity;
				
				if (performedSessions.length > 0) {
					lastSessionDate = new Date(performedSessions[0].completed_at);
					daysSinceLast = Math.floor(
						(Date.now() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24),
					);
				}

				// Stuck conditions:
				// - 0 completed steps (pct === 0)
				// - OR no sessions at all
				// - OR performed > 14 days ago
				const isStuck = done === 0 || performedSessions.length === 0 || daysSinceLast > 14;

				// Next step description
				let nextStep = "";
				if (done < total) {
					const currentIdx = ex.current_step_index ?? 0;
					nextStep = ex.steps?.[currentIdx]?.description ?? ex.steps?.[0]?.description ?? "";
				}

				return {
					id: ex.id,
					name: ex.name,
					done,
					total,
					pct,
					isStuck,
					nextStep,
					hasSession: performedSessions.length > 0,
				};
			})
	);
</script>

<div class="page page-layout">
	<header class="page-header">
		<h1 class="large-title">Analisi</h1>
		<p class="page-subtitle">Dove stai progredendo</p>
	</header>

	{#if totalSteps === 0}
		<div class="empty-state ios-card">
			<p class="empty">Nessun esercizio presente nel tuo programma. Aggiungi esercizi per visualizzare l'analisi.</p>
		</div>
	{:else}
		<!-- Progresso complessivo card -->
		<div class="card ios-card overall-card">
			<p class="card-title">Progresso complessivo</p>
			
			<div class="overall-row">
				<div class="progress-ring-container">
					<svg class="progress-ring" width="80" height="80">
						<circle
							class="progress-ring-bg"
							stroke="var(--color-track)"
							stroke-width="8"
							fill="transparent"
							r="32"
							cx="40"
							cy="40"
						/>
						<circle
							class="progress-ring-bar"
							stroke="var(--color-accent)"
							stroke-width="8"
							fill="transparent"
							r="32"
							cx="40"
							cy="40"
							stroke-dasharray="201.06"
							stroke-dashoffset={201.06 - (201.06 * overallPct) / 100}
							transform="rotate(-90 40 40)"
						/>
					</svg>
					<div class="progress-ring-text">{overallPct}%</div>
				</div>

				<div class="overall-info">
					<span class="overall-value">{completedSteps} di {totalSteps} step</span>
					<span class="course-badge">{exercisesInCourse} esercizi in corso</span>
				</div>
			</div>
		</div>

		<!-- Per Esercizio card -->
		<div class="card ios-card list-card">
			<p class="card-title">Per esercizio</p>
			
			<div class="exercise-list">
				{#each exerciseStats as ex}
					<div class="exercise-row">
						<div class="row-top">
							<div class="name-container">
								<a href={resolve("/exercises/[id]", { id: ex.id })} class="ex-name">
									{ex.name}
								</a>
								{#if ex.isStuck}
									<span class="stuck-badge">Fermo</span>
								{/if}
							</div>
							<span class="ex-pct" class:accent={ex.pct > 0}>{ex.pct}%</span>
						</div>
						
						<!-- Progress bar -->
						<div class="ex-progress-track">
							<div class="ex-progress-fill" style="width: {ex.pct}%"></div>
						</div>

						<div class="row-bottom">
							{#if ex.done === ex.total}
								<span class="ex-sub">{ex.done} di {ex.total} step · Completato ✓</span>
							{:else if ex.isStuck && ex.done > 0}
								<span class="ex-sub">{ex.done} di {ex.total} step · nessuna sessione recente</span>
							{:else if ex.nextStep}
								<span class="ex-sub">{ex.done} di {ex.total} step · prossimo: {ex.nextStep}</span>
							{:else}
								<span class="ex-sub">{ex.done} di {ex.total} step · nessuna sessione recente</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.page-layout {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 0 1rem 2rem;
	}

	.page-header {
		margin-bottom: 0.25rem;
	}

	.card {
		padding: 20px;
	}

	.card-title {
		margin: 0 0 16px;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.8px;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	/* ── Overall progression card ── */
	.overall-row {
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.progress-ring-container {
		position: relative;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.progress-ring-bg {
		opacity: 0.8;
	}

	.progress-ring-bar {
		stroke-linecap: round;
		transition: stroke-dashoffset 0.35s ease;
	}

	.progress-ring-text {
		position: absolute;
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text);
		font-variant-numeric: tabular-nums;
		font-feature-settings: 'tnum';
	}

	.overall-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
	}

	.overall-value {
		font-size: 22px;
		font-weight: 700;
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.course-badge {
		display: inline-flex;
		align-items: center;
		font-size: 13px;
		font-weight: 600;
		border-radius: 100px;
		padding: 4px 10px;
		background: #e8f5e9;
		color: #2d6a4f;
	}

	:global(html.dark) .course-badge {
		background: rgba(82, 183, 136, 0.15);
		color: #52b788;
	}

	/* ── Exercise list card ── */
	.exercise-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.exercise-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.row-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.name-container {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.ex-name {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ex-name:hover {
		color: var(--color-accent);
	}

	.stuck-badge {
		display: inline-flex;
		align-items: center;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		border-radius: 6px;
		padding: 2px 6px;
		background: #FFF3E0;
		color: #F97316;
		letter-spacing: 0.3px;
	}

	:global(html.dark) .stuck-badge {
		background: rgba(249, 115, 22, 0.15);
		color: #ff9800;
	}

	.ex-pct {
		font-size: 15px;
		font-weight: 500;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		font-feature-settings: 'tnum';
	}

	.ex-pct.accent {
		color: var(--color-accent);
		font-weight: 600;
	}

	.ex-progress-track {
		width: 100%;
		height: 6px;
		background: var(--color-track);
		border-radius: 3px;
		overflow: hidden;
	}

	.ex-progress-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: 3px;
		transition: width 0.4s ease;
	}

	.ex-sub {
		font-size: 13px;
		color: var(--color-muted);
		line-height: 1.4;
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
	}

	.empty {
		font-size: 15px;
		color: var(--color-muted);
		margin: 0;
		line-height: 1.5;
	}
</style>
