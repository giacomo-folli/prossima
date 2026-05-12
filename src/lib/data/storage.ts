import type { Exercise } from "../types/exercise";
import { parse } from "yaml";
import { makeSteps } from "./defaultExercises";

export async function loadFromFile(url: string = ""): Promise<Exercise[]> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch ${url}: ${response.status} ${response.statusText}`,
			);
		}

		// Extract the raw text from the response
		const yamlText = await response.text();
		const parsedData = parse(yamlText) as {
			version: number;
			exercises: Record<string, { name: string; steps: string[] }>;
		};

		if (!parsedData || !parsedData.exercises) {
			throw new Error("Invalid YAML structure: 'exercises' object is missing.");
		}

		// 3. Convert the dictionary object into an Exercise[] array
		const exercisesArray: Exercise[] = Object.entries(parsedData.exercises).map(
			([key, data]) => {
				return {
					id: key,
					name: data.name,
					steps: makeSteps(data.steps),
					currentStepIndex: 0,
				} as Exercise;
			},
		);

		return exercisesArray;
	} catch (error) {
		console.error("Error loading training plan:", error);
		// Rethrow the error so the calling component can handle it (e.g., show a UI error)
		throw error;
	}
}
