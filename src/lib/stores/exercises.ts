import { writable, derived, get } from "svelte/store";
import { ExerciseType } from "$lib/constants";
import type { Exercise } from "../types";
import {
	loadExercises,
	updateExerciseProgress,
	updateStepCompletion,
	insertExercise,
	removeExercise,
	updateExerciseInDB,
} from "../utils/storage";

function createExercisesStore() {
	const { subscribe, set, update } = writable<Exercise[]>([]);

	loadExercises().then((data) => {
		if (data) set(data);
	});

	return {
		subscribe,
		update,

		async completeCurrentStep(exerciseId: string) {
			const exercise = get(exercises).find((e) => e.id === exerciseId);
			if (!exercise || exercise.type !== ExerciseType.EXERCISE) return;

			const stepIndex = Number(exercise.current_step_index);
			const step = exercise?.steps?.find((st) => st.step_index === stepIndex);
			if (!step || step.completed) return;

			const nextIndex =
				stepIndex + 1 < Number(exercise?.steps?.length)
					? stepIndex + 1
					: stepIndex;

			await updateStepCompletion(step.id, true);
			await updateExerciseProgress(exercise.id, nextIndex);

			set((await loadExercises()) || []);
		},

		async undoLastCompletion(exerciseId: string) {
			const exercise = get(exercises).find((e) => e.id === exerciseId);
			if (!exercise || exercise.type !== ExerciseType.EXERCISE) return;

			const stepIndex = Number(exercise.current_step_index);
			const step = exercise.steps?.findLast((st) => st.completed);
			if (!step) return;

			const prevIndex = stepIndex === 0 ? 0 : stepIndex - 1;

			await updateStepCompletion(step.id, false);
			await updateExerciseProgress(exercise.id, prevIndex);

			set((await loadExercises()) || []);
		},

		async addExercise(
			name: string,
			stepDescriptions: string[],
		): Promise<boolean> {
			const newExercise = await insertExercise(name, stepDescriptions);
			if (!newExercise) return false;
			update((current) => [...current, newExercise]);
			return true;
		},

		set(newExercises?: Exercise[]) {
			const exercises = newExercises || [];
			set(exercises);
			// saveExercises(exercises);
		},

		clearProgress() {
			update((exercises) => {
				const next = exercises.map((ex) => {
					if (ex.type !== ExerciseType.EXERCISE) return ex;
					return {
						...ex,
						steps: ex.steps?.map((s) => ({
							...s,
							completed: false,
							completed_at: undefined,
						})),
						current_step_index: 0, // Fixed: changed from camelCase
					};
				});

				return next;
			});
		},

		async remove(exerciseId: string): Promise<boolean> {
			const success = await removeExercise(exerciseId);
			if (success) {
				update((current) => current.filter((e) => e.id !== exerciseId));
			}
			return true;
		},

		async updateExercise(
			exerciseId: string,
			name: string,
			steps: Array<{ id?: string; description: string; step_index: number; completed: boolean; completed_at?: string }>,
		): Promise<boolean> {
			const success = await updateExerciseInDB(exerciseId, name, steps);
			if (success) {
				set((await loadExercises()) || []);
			}
			return success;
		},
	};
}

// Fixed: Removed top-level await
export const exercises = createExercisesStore();

export const exerciseProgress = derived(exercises, (exs) => {
	return exs
		.filter((e) => e.type === ExerciseType.EXERCISE)
		.map((ex) => {
			const total = Number(ex.steps?.length ?? 0);
			const completedCount = Number(
				ex.steps?.filter((s) => s.completed).length ?? 0,
			);
			const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

			// Safe fallback if current_step_index is undefined or out of bounds
			const currentIndex = ex.current_step_index ?? 0;
			const current = ex.steps?.[currentIndex] ?? null;
			const next = ex.steps?.[currentIndex + 1] ?? null;
			const isComplete = total > 0 && completedCount === total;

			return {
				id: ex.id,
				name: ex.name,
				completedCount,
				total,
				pct,
				current,
				next,
				isComplete,
			};
		});
});
