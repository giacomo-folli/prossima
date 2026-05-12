<script lang="ts">
	import { loadFromFile } from "$lib/data/storage";
	import { exercises } from "$lib/stores/exercises";
	import { loadExercises, saveExercises } from "$lib/utils/storage";

	let loading = $state(false);
	async function handleLoadTrainingFile() {
		const url = "https://giacomo-folli.github.io/prossima/training_plan.yaml";
		const exercises_from_file = await loadFromFile(url);
		const current_exercises = loadExercises() ?? [];

		if (confirm("Sei sicuro? Questo resetterà i progressi correnti.")) {
			loading = true;
			saveExercises(exercises_from_file);

			$exercises = loadExercises() ?? current_exercises;
			loading = false;
		}
	}
</script>

<button
	class="btn-reload-file"
	onclick={handleLoadTrainingFile}
	disabled={loading}>Ricarica il file</button
>

<style>
	.btn-reload-file {
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 7px;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: opacity 0.1s;
	}

	.btn-reload-file:hover {
		opacity: 0.85;
	}
</style>
