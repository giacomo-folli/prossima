import type { Exercise, ExerciseDefinition } from "../types";
import { parse } from "yaml";

export async function parseYamlString(
	string: string = "",
): Promise<Exercise[]> {
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
			let firstCompletedIndex = data.steps.findIndex(
				(s) => s?.completed === true,
			);
			if (firstCompletedIndex === -1) firstCompletedIndex = 0;
			const nextStep =
				firstCompletedIndex + 1 < data.steps.length
					? firstCompletedIndex + 1
					: firstCompletedIndex;

			return {
				id: key,
				name: data.name,
				steps: makeStepsImproved(data.steps, nextStep),
				currentStepIndex: nextStep,
			} as Exercise;
		});

		return exercisesArray;
	} catch (error) {
		console.error("Error parsing yaml string plan:", error);
		throw error;
	}
}

export function makeSteps(labels: string[]) {
	return labels.map((label, i) => ({
		id: `step-${i}`,
		label,
		completed: false,
		completedAt: undefined,
	}));
}

export function makeStepsImproved(
	steps: ExerciseDefinition["steps"],
	currentStepIndex: number,
) {
	return steps.map((item, i) => ({
		id: `step-${i}`,
		label: item.description,
		completed: i <= currentStepIndex ? true : false,
		// TODO: pass the completion date from YAML file
		completedAt: new Date().toISOString(),
	}));
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
