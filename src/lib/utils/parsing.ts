import type { Exercise, ExerciseDefinition } from "../types";
import { parse, stringify } from "yaml";

export function toYamlString(exercises: Exercise[]): string {
	try {
		const data = exercises.map((e) => {
			const temp = { ...e } as any;
			delete temp.currentStepIndex;
			return temp;
		});

		return stringify({
			version: 1,
			exercises: Object.fromEntries(data.map((d) => [d.id, d])),
		});
	} catch (error) {
		console.error("Error converting exercises to yaml string:", error);
		throw error;
	}
}

export function parseYamlString(string: string = ""): Exercise[] {
	try {
		const parsedData = parse(string) as {
			version: number;
			exercises: Record<string, ExerciseDefinition>;
		};

		if (!parsedData || !parsedData.exercises) {
			throw new Error("Invalid YAML structure: 'exercises' object is missing.");
		}

		const parsedExercises = Object.entries(parsedData.exercises);
		const exercisesArray: Exercise[] = parsedExercises.map(([key, data]) => {
			let lastCompletedStepIndex = data.steps.findIndex(
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

		return exercisesArray;
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
  <exercise_id>:
    name: "<Exercise Name>"
    steps:
      - description: "<step 1 description>"
	    completed: true
      - description: "<step 2 description>"
      - description: "<step 3 description>"

# Example structure:
# exercises:
#   push-ups:
#     name: "Push-Ups"
#     steps:
#       - description: "3 sets of 10 reps"
#         completed: true
#       - description: "3 sets of 6 reps"
#         completed: true
#       - description: "3 sets of 8 reps"
#         completed: true
`;
