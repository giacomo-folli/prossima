<script lang="ts">
	import ExerciseCard from "$lib/components/ExerciseCard.svelte";
	import { exerciseProgress } from "$lib/stores/exercises";
</script>

<main class="page">
	<header class="exercises-header">
		<h1 class="large-title">Esercizi</h1>
		<p class="page-subtitle">Il tuo programma di allenamento</p>
	</header>

	<div class="exercises-grid">
		{#each $exerciseProgress as ex (ex.id)}
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

<style>
	.exercises-header {
		margin-bottom: 1.25rem;
	}

	.exercises-grid {
		display: grid;
		/* Change 1fr to minmax(0, 1fr) */
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
	}

	@media (min-width: 600px) {
		.exercises-grid {
			grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
			gap: 1rem;
		}
	}
</style>
