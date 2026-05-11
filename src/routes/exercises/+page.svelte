<script lang="ts">
	import ExerciseCard from "$lib/components/ExerciseCard.svelte";
	import { exerciseProgress } from "$lib/stores/exercises";

	const progress = exerciseProgress;
</script>

<main>
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

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}
</style>
