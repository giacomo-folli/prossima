import { writable, derived } from "svelte/store";
import type { Exercise, Step } from "../types";
import { loadExercises, saveExercises } from "../utils/storage";

function createExercisesStore() {
	const initial = loadExercises() ?? [];
	const { subscribe, set, update } = writable<Exercise[]>(initial);

	return {
		subscribe,

		completeCurrentStep(exerciseId: string) {
			let toSave: Exercise[] = [];

			update((exercises) => {
				const next = exercises.map((ex) => {
					if (ex.id !== exerciseId) return ex;

					const stepIndex = ex.currentStepIndex;
					const step = ex.steps[stepIndex];
					if (!step || step.completed) return ex;

					const newSteps = ex.steps.map((s, i) =>
						i === stepIndex
							? { ...s, completed: true, completedAt: new Date().toISOString() }
							: s,
					);

					const nextIndex =
						stepIndex + 1 < ex.steps.length ? stepIndex + 1 : stepIndex;

					return { ...ex, steps: newSteps, currentStepIndex: nextIndex };
				});

				toSave = next;
				return next;
			});

			saveExercises(toSave, true);
		},

		undoLastCompletion(exerciseId: string) {
			let toSave: Exercise[] = [];

			update((exercises) => {
				const next = exercises.map((ex) => {
					if (ex.id !== exerciseId) return ex;

					let lastCompletedIndex = -1;
					for (let i = ex.steps.length - 1; i >= 0; i--) {
						if (ex.steps[i].completed) {
							lastCompletedIndex = i;
							break;
						}
					}
					if (lastCompletedIndex === -1) return ex;

					const newSteps = ex.steps.map((s, i) =>
						i === lastCompletedIndex
							? { ...s, completed: false, completedAt: undefined }
							: s,
					);

					return {
						...ex,
						steps: newSteps,
						currentStepIndex: lastCompletedIndex,
					};
				});

				toSave = next;
				return next;
			});

			saveExercises(toSave, true);
		},

		set(newExercises?: Exercise[]) {
			const exercises = newExercises || [];
			set(exercises);

			saveExercises(exercises);
		},

		clearProgress() {
			update((exercises) => {
				const newExercise = exercises.map((ex) => ({
					...ex,
					steps: ex.steps.map((s) => ({
						...s,
						completed: false,
						completedAt: undefined,
					})),
					currentStepIndex: 0,
				}));

				saveExercises(newExercise);
				return newExercise;
			});
		},
	};
}

export const exercises = createExercisesStore();

export const exerciseProgress = derived(exercises, (exs) => {
	return exs.map((ex) => {
		const completedCount = ex.steps.filter((s) => s.completed).length;
		const total = ex.steps.length;
		const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);
		const current = ex.steps[ex.currentStepIndex] ?? null;
		const next = ex.steps[ex.currentStepIndex + 1] ?? null;
		const isComplete = completedCount === total;

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
