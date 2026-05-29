<script lang="ts">
	import { resolve } from "$app/paths";
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";
	import {
		avgSessionsPerWeek,
		currentStreak,
		daysSinceLastSession,
		longestStreak,
		weeksActive,
	} from "$lib/utils/sessions-stats";

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
	const fullyDoneExercises = $derived(
		filteredExercises.filter((ex) => ex.steps?.every((s) => s.completed))
			.length,
	);

	// ─── per-exercise stats ────────────────────────────────────────────────────
	const exerciseStats = $derived(
		filteredExercises.map((ex) => {
			const done = Number(ex.steps?.filter((s) => s.completed).length);
			const pct =
				ex.steps?.length === 0
					? 0
					: Math.round((done / Number(ex.steps?.length)) * 100);
			const timesPerformed = $sessions.filter((ses) =>
				ses.exercises.some((e) => e.id === ex.id),
			).length;
			return {
				id: ex.id,
				name: ex.name,
				done,
				total: Number(ex.steps?.length),
				pct,
				timesPerformed,
			};
		}),
	);

	const byFrequency = $derived(
		[...exerciseStats].sort((a, b) => b.timesPerformed - a.timesPerformed),
	);

	// ─── session cadence ───────────────────────────────────────────────────────
	const totalSessions = $derived($sessions.length);

	function getWeekKey(iso: string) {
		const d = new Date(iso);
		const jan1 = new Date(d.getFullYear(), 0, 1);
		const week = Math.ceil(
			((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7,
		);
		return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
	}

	const weeklyBuckets = $derived(() => {
		const map = new Map<string, number>();
		for (const s of $sessions) {
			const k = getWeekKey(s.completed_at);
			map.set(k, (map.get(k) ?? 0) + 1);
		}
		const weeks: { label: string; count: number }[] = [];
		for (let i = 7; i >= 0; i--) {
			const d = new Date();
			d.setDate(d.getDate() - i * 7);
			const k = getWeekKey(d.toISOString());
			const weekNum = k.split("-W")[1];
			weeks.push({ label: `W${weekNum}`, count: map.get(k) ?? 0 });
		}
		return weeks;
	});

	// const weeksWithSession = $derived(
	// 	weeklyBuckets().filter((w) => w.count > 0).length,
	// );

	const weeksActiveCount = $derived(weeksActive($sessions));
	const avgPerWeek = $derived(avgSessionsPerWeek($sessions));
	const streakCurrent = $derived(currentStreak($sessions));
	const streakLongest = $derived(longestStreak($sessions));

	const lastSessionDate = $derived(
		$sessions.length > 0
			? new Date($sessions[0].completed_at).toLocaleDateString("it-IT", {
					weekday: "short",
					day: "2-digit",
					month: "short",
				})
			: null,
	);

	const daysSinceLast = $derived(daysSinceLastSession($sessions));

	const maxFreq = $derived(
		Math.max(1, ...byFrequency.map((e) => e.timesPerformed)),
	);
	const maxWeekCount = $derived(
		Math.max(1, ...weeklyBuckets().map((w) => w.count)),
	);
</script>

<div class="page page-layout">
	<header class="page-header">
		<h1 class="large-title">Analisi</h1>
		<p class="page-subtitle sub">
			{totalSessions} sessioni · {completedSteps}/{totalSteps} step completati
		</p>
	</header>

	{#if totalSessions === 0 && completedSteps === 0}
		<p class="empty">
			Nessun dato ancora. Registra qualche sessione e completa qualche step.
		</p>
	{:else}
		<div class="card ios-card">
			<p class="card-title">
				Sessioni per settimana <span class="card-title-sub">(ultime 8)</span>
			</p>
			<div class="bar-chart">
				{#each weeklyBuckets() as week}
					<div class="bar-col">
						<span class="bar-count">{week.count > 0 ? week.count : ""}</span>
						<div class="bar-wrap">
							<div
								class="bar-fill"
								class:bar-empty={week.count === 0}
								style="height: {Math.round((week.count / maxWeekCount) * 100)}%"
							></div>
						</div>
						<span class="bar-label">{week.label}</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="stat-row">
			<div class="stat-card ios-card">
				<span class="stat-value">{overallPct}%</span>
				<span class="stat-label">Totale</span>
				<div class="mini-bar-track">
					<div class="mini-bar-fill" style="width:{overallPct}%"></div>
				</div>
				<span class="stat-sub">{completedSteps} di {totalSteps} step</span>
			</div>

			<div class="stat-card ios-card">
				<span class="stat-value">{totalSessions}</span>
				<div class="stat-accent-line"></div>
				<span class="stat-label">Sessioni totali</span>
				<span class="stat-sub">
					{#if lastSessionDate}
						Ultima: {lastSessionDate}
						{#if daysSinceLast === 0}· oggi{:else if daysSinceLast === 1}· ieri{:else}·
							{daysSinceLast}gg fa{/if}
					{:else}Nessuna ancora{/if}
				</span>
			</div>
		</div>

		<!-- <div class="card ios-card">
			<p class="card-title">Streak</p>
			<div class="streak-row">
				<div class="streak-item">
					<span class="streak-val">{streakCurrent}</span>
					<span class="streak-lbl">giorni attuale</span>
				</div>
				<div class="streak-divider"></div>
				<div class="streak-item">
					<span class="streak-val">{streakLongest}</span>
					<span class="streak-lbl">giorni record</span>
				</div>
			</div>
		</div> -->

		<div class="card ios-card">
			<p class="card-title">Frequenza per esercizio</p>
			<ul class="freq-list">
				{#each byFrequency as ex}
					<li class="freq-item">
						<div class="freq-header">
							<span class="freq-name">{ex.name}</span>
							<span class="freq-count">{ex.timesPerformed}×</span>
						</div>
						<div class="freq-bar-wrap">
							<div
								class="freq-bar-fill"
								class:freq-bar-zero={ex.timesPerformed === 0}
								style="width: {Math.round(
									(ex.timesPerformed / maxFreq) * 100,
								)}%"
							></div>
						</div>
					</li>
				{/each}
			</ul>
		</div>

		<div class="card ios-card">
			<p class="card-title">Progressione per esercizio</p>
			<ul class="prog-list">
				{#each exerciseStats as ex}
					<li class="prog-item">
						<div class="prog-top">
							<a
								href={resolve("/exercises/[id]", { id: ex.id })}
								class="prog-name">{ex.name}</a
							>
							<span class="prog-pct">{ex.pct}%</span>
						</div>
						<div class="prog-bar-track">
							<div class="prog-bar-fill" style="width:{ex.pct}%"></div>
						</div>
						<span class="prog-sub">{ex.done} / {ex.total} step</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.page-layout {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0 1rem 2rem;
	}

	.page-header {
		margin-bottom: 0.25rem;
	}

	.sub {
		margin: 0;
	}

	/* ── stat row: 2x2 grid ── */
	.stat-row {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.stat-card {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-value {
		font-size: 34px;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--color-text);
		line-height: 1;
		font-variant-numeric: tabular-nums;
		font-feature-settings: "tnum";
	}

	.stat-accent-line {
		width: 40px;
		height: 2px;
		background: var(--color-accent);
		border-radius: 1px;
		margin-top: 4px;
		margin-bottom: 4px;
	}

	.stat-label {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.6px;
		font-weight: 600;
		color: var(--color-muted);
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.mini-bar-track {
		width: 100%;
		height: 3px;
		background: var(--color-track);
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 0.25rem;
	}

	.mini-bar-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	.stat-sub {
		font-size: 13px;
		color: var(--color-muted);
		line-height: 1.3;
		margin-top: 4px;
	}

	.card {
		padding: 1.25rem;
	}

	.card-title {
		margin: 0 0 1.25rem;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.8px;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.card-title-sub {
		text-transform: none;
		letter-spacing: normal;
		font-weight: 400;
		opacity: 0.7;
	}

	/* ── streak ── */
	.streak-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.streak-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
	}

	.streak-val {
		font-size: 34px;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--color-text);
		line-height: 1;
		font-variant-numeric: tabular-nums;
		font-feature-settings: "tnum";
	}

	.streak-lbl {
		font-size: 13px;
		color: var(--color-muted);
		text-align: center;
	}

	.streak-divider {
		width: 1px;
		height: 2.5rem;
		background: var(--color-border);
		flex-shrink: 0;
	}

	/* ── weekly bar chart ── */
	.bar-chart {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		height: 120px;
		padding-top: 0.5rem;
	}

	.bar-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		gap: 0.35rem;
	}

	.bar-count {
		font-size: 11px;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		font-feature-settings: "tnum";
		min-height: 1rem;
	}

	.bar-wrap {
		flex: 1;
		width: 100%;
		display: flex;
		align-items: flex-end;
		border-bottom: 1px solid var(--color-track);
	}

	.bar-fill {
		width: 100%;
		background: var(--color-accent);
		border-radius: 2px 2px 0 0;
		min-height: 2px;
		transition: height 0.35s ease;
	}

	.bar-fill.bar-empty {
		background: transparent;
		height: 0 !important;
	}

	.bar-label {
		font-size: 11px;
		color: var(--color-muted);
		white-space: nowrap;
		margin-top: 0.2rem;
	}

	/* ── frequency list ── */
	.freq-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.freq-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.freq-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.freq-name {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.freq-count {
		font-size: 0.85rem;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
	}

	.freq-bar-wrap {
		height: 4px;
		width: 100%;
		background: var(--color-track, #2c2c2e);
		border-radius: 2px;
		overflow: hidden;
	}

	.freq-bar-fill {
		height: 100%;
		background: var(--color-accent, #2c974b);
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	.freq-bar-fill.freq-bar-zero {
		width: 0 !important;
	}

	/* ── per-exercise progress ── */
	.prog-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.prog-item {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.prog-top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
	}

	.prog-name {
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--color-text);
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.prog-name:hover {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.prog-pct {
		font-size: 0.85rem;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	.prog-bar-track {
		width: 100%;
		height: 4px;
		background: var(--color-track, #2c2c2e);
		border-radius: 2px;
		overflow: hidden;
	}

	.prog-bar-fill {
		height: 100%;
		background: var(--color-accent, #2c974b);
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	.prog-sub {
		font-size: 0.75rem;
		color: var(--color-muted);
	}
</style>
