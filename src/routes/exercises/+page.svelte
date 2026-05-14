<script lang="ts">
	import ExerciseCard from "$lib/components/ExerciseCard.svelte";
	import { exerciseProgress, exercises } from "$lib/stores/exercises";

	exercises.subscribe((v) => console.log("exercises changed", v));
	exerciseProgress.subscribe((v) => console.log("progress changed", v));
</script>

<main>
	<div class="grid">
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
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}
</style>
