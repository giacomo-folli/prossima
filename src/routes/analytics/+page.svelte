<script lang="ts">
	import { resolve } from "$app/paths";
	import { exercises } from "$lib/stores/exercises";
	import { sessions } from "$lib/stores/sessions";

	// ─── overall exercise completion ───────────────────────────────────────────
	const totalSteps = $derived(
		$exercises.reduce((s, ex) => s + ex.steps.length, 0),
	);
	const completedSteps = $derived(
		$exercises.reduce(
			(s, ex) => s + ex.steps.filter((st) => st.completed).length,
			0,
		),
	);
	const overallPct = $derived(
		totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100),
	);
	const fullyDoneExercises = $derived(
		$exercises.filter((ex) => ex.steps.every((s) => s.completed)).length,
	);

	// ─── per-exercise stats ────────────────────────────────────────────────────
	const exerciseStats = $derived(
		$exercises.map((ex) => {
			const done = ex.steps.filter((s) => s.completed).length;
			const pct =
				ex.steps.length === 0 ? 0 : Math.round((done / ex.steps.length) * 100);
			const timesPerformed = $sessions.filter((ses) =>
				ses.exercises.some((e) => e.exerciseId === ex.id),
			).length;
			return {
				id: ex.id,
				name: ex.name,
				done,
				total: ex.steps.length,
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
			const k = getWeekKey(s.completedAt);
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

	const weeksWithSession = $derived(
		weeklyBuckets().filter((w) => w.count > 0).length,
	);

	function weeksActive(): number {
		if ($sessions.length === 0) return 1;
		const oldest = new Date($sessions[$sessions.length - 1].completedAt);
		const diffMs = Date.now() - oldest.getTime();
		return Math.max(1, Math.ceil(diffMs / (7 * 86400000)));
	}

	const avgPerWeek = $derived(
		totalSessions === 0
			? 0
			: (totalSessions / Math.max(weeksActive(), 1)).toFixed(1),
	);

	const longestStreak = $derived(() => {
		if ($sessions.length === 0) return 0;
		const days = [
			...new Set(
				$sessions.map((s) =>
					new Date(s.completedAt).toISOString().slice(0, 10),
				),
			),
		].sort();
		let max = 1,
			cur = 1;
		for (let i = 1; i < days.length; i++) {
			const diff =
				(new Date(days[i]).getTime() - new Date(days[i - 1]).getTime()) /
				86400000;
			if (diff === 1) {
				cur++;
				max = Math.max(max, cur);
			} else cur = 1;
		}
		return max;
	});

	const currentStreak = $derived(() => {
		if ($sessions.length === 0) return 0;
		const days = [
			...new Set(
				$sessions.map((s) =>
					new Date(s.completedAt).toISOString().slice(0, 10),
				),
			),
		]
			.sort()
			.reverse();
		const today = new Date().toISOString().slice(0, 10);
		const yesterday = new Date(Date.now() - 86400000)
			.toISOString()
			.slice(0, 10);
		if (days[0] !== today && days[0] !== yesterday) return 0;
		let streak = 1;
		for (let i = 1; i < days.length; i++) {
			const diff =
				(new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) /
				86400000;
			if (diff === 1) streak++;
			else break;
		}
		return streak;
	});

	const lastSessionDate = $derived(
		$sessions.length > 0
			? new Date($sessions[0].completedAt).toLocaleDateString("it-IT", {
					weekday: "short",
					day: "2-digit",
					month: "short",
				})
			: null,
	);

	const daysSinceLast = $derived(
		$sessions.length > 0
			? Math.floor(
					(Date.now() - new Date($sessions[0].completedAt).getTime()) /
						86400000,
				)
			: null,
	);

	const maxFreq = $derived(
		Math.max(1, ...byFrequency.map((e) => e.timesPerformed)),
	);
	const maxWeekCount = $derived(
		Math.max(1, ...weeklyBuckets().map((w) => w.count)),
	);
</script>

<svelte:head>
	<title>Analisi — Progressioni</title>
</svelte:head>

<header class="page-header">
	<h1>Analisi</h1>
	<p class="sub">
		{totalSessions} sessioni · {completedSteps}/{totalSteps} step completati
	</p>
</header>

{#if totalSessions === 0 && completedSteps === 0}
	<p class="empty">
		Nessun dato ancora. Registra qualche sessione e completa qualche step.
	</p>
{:else}
	<!-- ── ROW 1: top stats ── -->
	<div class="stat-row">
		<div class="stat-card">
			<span class="stat-value">{overallPct}%</span>
			<span class="stat-label">Totale</span>
			<div class="mini-bar-track">
				<div class="mini-bar-fill" style="width:{overallPct}%"></div>
			</div>
			<span class="stat-sub">{completedSteps} di {totalSteps} step</span>
		</div>

		<div class="stat-card">
			<span class="stat-value">{fullyDoneExercises}/{$exercises.length}</span>
			<span class="stat-label">Esercizi completati</span>
			<div class="mini-bar-track">
				<div
					class="mini-bar-fill"
					style="width:{$exercises.length === 0
						? 0
						: Math.round((fullyDoneExercises / $exercises.length) * 100)}%"
				></div>
			</div>
			<span class="stat-sub"
				>{$exercises.length - fullyDoneExercises} ancora in corso</span
			>
		</div>

		<div class="stat-card">
			<span class="stat-value">{totalSessions}</span>
			<span class="stat-label">Sessioni totali</span>
			<span class="stat-sub">
				{#if lastSessionDate}
					Ultima: {lastSessionDate}
					{#if daysSinceLast === 0}· oggi{:else if daysSinceLast === 1}· ieri{:else}·
						{daysSinceLast}gg fa{/if}
				{:else}Nessuna ancora{/if}
			</span>
		</div>

		<div class="stat-card">
			<span class="stat-value">{avgPerWeek}</span>
			<span class="stat-label">Sessioni / settimana</span>
			<span class="stat-sub"
				>media su {weeksActive()} settiman{weeksActive() === 1
					? "a"
					: "e"}</span
			>
		</div>
	</div>

	<!-- ── ROW 2: streak card ── -->
	<div class="card">
		<p class="card-title">Streak</p>
		<div class="streak-row">
			<div class="streak-item">
				<span class="streak-val">{currentStreak()}</span>
				<span class="streak-lbl">giorni attuale</span>
			</div>
			<div class="streak-divider"></div>
			<div class="streak-item">
				<span class="streak-val">{longestStreak()}</span>
				<span class="streak-lbl">giorni record</span>
			</div>
			<div class="streak-divider"></div>
			<div class="streak-item">
				<span class="streak-val">{weeksWithSession}</span>
				<span class="streak-lbl">settimane attive</span>
			</div>
		</div>
	</div>

	<!-- ── ROW 3: weekly bar chart ── -->
	<div class="card">
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

	<!-- ── ROW 4: frequency per exercise ── -->
	<div class="card">
		<p class="card-title">Frequenza per esercizio</p>
		<ul class="freq-list">
			{#each byFrequency as ex}
				<li class="freq-item">
					<span class="freq-name">{ex.name}</span>
					<div class="freq-bar-wrap">
						<div
							class="freq-bar-fill"
							class:freq-bar-zero={ex.timesPerformed === 0}
							style="width: {Math.round((ex.timesPerformed / maxFreq) * 100)}%"
						></div>
					</div>
					<span class="freq-count">{ex.timesPerformed}×</span>
				</li>
			{/each}
		</ul>
	</div>

	<!-- ── ROW 5: per-exercise progress breakdown ── -->
	<div class="card">
		<p class="card-title">Progressione per esercizio</p>
		<ul class="prog-list">
			{#each exerciseStats as ex}
				<li class="prog-item">
					<div class="prog-top">
						<a href={resolve(`/exercises/${ex.id}`)} class="prog-name"
							>{ex.name}</a
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

<style>
	.page-header {
		margin-bottom: 1.5rem;
	}

	h1 {
		margin: 0;
		font-size: 1.4rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--color-text);
	}

	.sub {
		margin: 0.3rem 0 0;
		font-size: 0.82rem;
		color: var(--color-muted);
	}

	/* ── stat row: 2-col on mobile, 4-col on desktop ── */
	.stat-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
		margin-bottom: 0.6rem;
	}

	@media (min-width: 640px) {
		.stat-row {
			grid-template-columns: repeat(4, 1fr);
			gap: 0.75rem;
			margin-bottom: 0.75rem;
		}
	}

	.stat-card {
		background: var(--color-card);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 0.9rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.12rem;
	}

	@media (min-width: 640px) {
		.stat-card {
			padding: 1.1rem 1.25rem;
		}
	}

	.stat-value {
		font-size: 1.55rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--color-text);
		line-height: 1;
	}

	@media (min-width: 640px) {
		.stat-value {
			font-size: 1.9rem;
		}
	}

	.stat-label {
		font-size: 0.67rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-muted);
		margin-bottom: 0.4rem;
		margin-top: 0.4rem;
	}

	.mini-bar-track {
		width: 100%;
		height: 3px;
		background: var(--color-track);
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 0.35rem;
	}

	.mini-bar-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	.stat-sub {
		font-size: 0.68rem;
		color: var(--color-muted);
		line-height: 1.3;
	}

	/* ── generic card spacing ── */
	.card {
		margin-bottom: 0.6rem;
	}

	@media (min-width: 640px) {
		.card {
			padding: 1.1rem 1.25rem;
			margin-bottom: 0.75rem;
		}
	}

	.card:last-child {
		margin-bottom: 0;
	}

	/* ── streak ── */
	.streak-row {
		display: flex;
		align-items: center;
	}

	.streak-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}

	.streak-val {
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--color-text);
		line-height: 1;
	}

	@media (min-width: 640px) {
		.streak-val {
			font-size: 2rem;
		}
	}

	.streak-lbl {
		font-size: 0.65rem;
		color: var(--color-muted);
		text-align: center;
	}

	.streak-divider {
		width: 1px;
		height: 2.25rem;
		background: var(--color-border);
		flex-shrink: 0;
	}

	/* ── weekly bar chart ── */
	.bar-chart {
		display: flex;
		align-items: flex-end;
		gap: 0.3rem;
		height: 80px;
	}

	@media (min-width: 480px) {
		.bar-chart {
			gap: 0.5rem;
			height: 100px;
		}
	}

	.bar-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		gap: 0.2rem;
	}

	.bar-count {
		font-size: 0.6rem;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		min-height: 0.85rem;
	}

	.bar-wrap {
		flex: 1;
		width: 100%;
		display: flex;
		align-items: flex-end;
	}

	.bar-fill {
		width: 100%;
		background: var(--color-accent);
		border-radius: 3px 3px 0 0;
		min-height: 3px;
		transition: height 0.35s ease;
	}

	.bar-fill.bar-empty {
		background: var(--color-track);
		height: 3px !important;
	}

	.bar-label {
		font-size: 0.58rem;
		color: var(--color-muted);
		white-space: nowrap;
	}

	/* ── frequency list ── */
	.freq-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.freq-item {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto auto;
		gap: 0.2rem 0.6rem;
		align-items: center;
	}

	.freq-name {
		font-size: 0.82rem;
		color: var(--color-text);
		grid-column: 1;
		grid-row: 1;
	}

	.freq-count {
		font-size: 0.75rem;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		grid-column: 2;
		grid-row: 1;
		text-align: right;
	}

	.freq-bar-wrap {
		height: 5px;
		background: var(--color-track);
		border-radius: 3px;
		overflow: hidden;
		grid-column: 1 / -1;
		grid-row: 2;
	}

	.freq-bar-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: 3px;
		transition: width 0.4s ease;
	}

	.freq-bar-fill.freq-bar-zero {
		width: 0 !important;
	}

	/* on wider screens: name + bar + count in one row */
	@media (min-width: 480px) {
		.freq-item {
			grid-template-columns: 120px 1fr 2.5rem;
			grid-template-rows: auto;
			gap: 0.75rem;
			align-items: center;
		}

		.freq-name {
			grid-column: 1;
			grid-row: 1;
		}
		.freq-bar-wrap {
			grid-column: 2;
			grid-row: 1;
			height: 6px;
		}
		.freq-count {
			grid-column: 3;
			grid-row: 1;
		}
	}

	/* ── per-exercise progress ── */
	.prog-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.prog-item {
		display: flex;
		flex-direction: column;
		gap: 0.28rem;
	}

	.prog-top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
	}

	.prog-name {
		font-size: 0.85rem;
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
		font-size: 0.75rem;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	.prog-bar-track {
		width: 100%;
		height: 4px;
		background: var(--color-track);
		border-radius: 2px;
		overflow: hidden;
	}

	.prog-bar-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	.prog-sub {
		font-size: 0.7rem;
		color: var(--color-muted);
	}
</style>
