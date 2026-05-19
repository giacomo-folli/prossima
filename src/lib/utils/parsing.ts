import type { Exercise, ExerciseDefinition, QuickExercise } from "../types";
import { parse, stringify } from "yaml";

export function toYamlString(params: {
	exercises: Exercise[];
	quick?: QuickExercise[];
}): string {
	try {
		const data = params.exercises.map((e) => {
			const temp = { ...e } as any;
			delete temp.currentStepIndex;
			return temp;
		});

		return stringify({
			version: 1,
			exercises: Object.fromEntries(data.map((d) => [d.id, d])),
			"quick-exercises": params.quick,
		});
	} catch (error) {
		console.error("Error converting exercises to yaml string:", error);
		throw error;
	}
}

export function parseYamlString(string: string = ""): {
	exercises: Exercise[];
	quickExercises?: QuickExercise[];
} {
	try {
		const parsedData = parse(string) as {
			version: number;
			exercises: Record<string, ExerciseDefinition>;
			"quick-exercises"?: {
				id: string;
				label: string;
				emoji?: string;
			}[];
		};

		if (!parsedData || !parsedData.exercises) {
			throw new Error("Invalid YAML structure: 'exercises' object is missing.");
		}

		const parsedExercises = Object.entries(parsedData.exercises);
		const parsedQuickExercises = parsedData?.["quick-exercises"] ?? [];

		const exercisesArray: Exercise[] = parsedExercises.map(([key, data]) => {
			let lastCompletedStepIndex = data.steps.findLastIndex(
				(s) => s?.completed === true,
			);
			let firstUncompletedStep = 0;

			if (lastCompletedStepIndex !== -1) {
				firstUncompletedStep =
					lastCompletedStepIndex + 1 < data.steps.length
						? lastCompletedStepIndex + 1
						: lastCompletedStepIndex;
			}

			return {
				id: key,
				name: data.name,
				steps: makeSteps(data.steps, firstUncompletedStep),
				currentStepIndex: firstUncompletedStep,
			} as Exercise;
		});

		return { exercises: exercisesArray, quickExercises: parsedQuickExercises };
	} catch (error) {
		console.error("Error parsing yaml string plan:", error);
		throw error;
	}
}

export function makeSteps(
	steps: ExerciseDefinition["steps"],
	lastCompletedStepIndex: number,
) {
	let allComplete = false;
	if (steps.at(-1)?.completed) {
		allComplete = true;
	}

	const stepsFormatted = steps.map((item, i) => {
		const completed = allComplete || i < lastCompletedStepIndex;
		let completedAt = undefined;
		if (completed && item?.completedAt) {
			const raw =
				typeof (item.completedAt as unknown) === "string"
					? item.completedAt
					: item.completedAt.toString();
			completedAt = new Date(raw).toISOString();
		}

		return {
			id: `step-${i}`,
			description: item.description,
			completed: completed,
			completedAt: completedAt,
		};
	});
	return stepsFormatted;
}

export const defaultExercises = `version: 1
exercises:
  push-ups:
    id: push-ups
    name: Push-Ups
    steps:
      - id: step-0
        description: 3 sets of 10 reps (Bent knees)
        completed: false
      - id: step-1
        description: 3 sets of 6 reps
        completed: false
      - id: step-2
        description: 3 sets of 8 reps
        completed: false
  squat:
    id: squat
    name: Squats
    steps:
      - id: step-0
        description: 6 sets of 8 reps (40 kg)
        completed: false
      - id: step-1
        description: 5 sets of 10 reps (40 kg)
        completed: false
      - id: step-2
        description: 5 sets of 10 reps (44 kg)
        completed: false
quick-exercises:
  - id: yoga
    label: Yoga
    emoji: 🧘
  - id: stretching
    label: Stretching
    emoji: 🤸
  - id: fisio
    label: Esercizi per caviglia
    emoji: 🦶🏼
`;
