<script lang="ts">
	import ExerciseCard from "$lib/components/ExerciseCard.svelte";
	import StatsRow from "$lib/components/StatsRow.svelte";
	import { exerciseProgress } from "$lib/stores/exercises";

	const progress = exerciseProgress;

	function overallPct(p: typeof $progress) {
		return p.length
			? Math.round(p.reduce((sum, e) => sum + e.pct, 0) / p.length)
			: 0;
	}
</script>

<svelte:head>
	<title>Progressioni</title>
</svelte:head>

<div class="page">
	<header class="site-header">
		<div class="header-inner">
			<h1>Progressioni</h1>
		</div>
	</header>

	<main>
		<StatsRow />

		<div class="grid">
			{#each $progress as ex (ex.id)}
				<ExerciseCard
					id={ex.id}
					name={ex.name}
					pct={ex.pct}
					completedCount={ex.completedCount}
					total={ex.total}
					current={ex.current}
					next={ex.next}
					isComplete={ex.isComplete}
				/>
			{/each}
		</div>
	</main>
</div>

<style>
	.page {
		max-width: 860px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 4rem;
	}

	.site-header {
		margin-bottom: 1rem;
	}

	.header-inner {
		display: flex;
		align-items: baseline;
		gap: 1rem;
	}

	h1 {
		margin: 0;
		font-size: 1.6rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--color-text);
	}

	.overall-pct {
		font-size: 0.85rem;
		color: var(--color-muted);
	}

	.subtitle {
		margin: 0.3rem 0 0;
		font-size: 0.85rem;
		color: var(--color-muted);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}
</style>
