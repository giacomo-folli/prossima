/** Represents an individual step in a training exercise. */
export interface Step {
	id: string;
	label: string;
	completed: boolean;
	completedAt?: string;
	exercise?: Exercise;
}

/** Represents an exercise in a training program, including
 *  its ordered steps and current progress. */
export interface Exercise {
	id: string;
	name: string;
	steps: Step[];
	currentStepIndex: number;
}

/** Represents a snapshot of an exercise within a training session
 * , including the current step label. */
export interface SessionExercise {
	exerciseId: string;
	exerciseName: string;
	stepLabel: string;
}

/** Represents a completed training session with metadata and the
 * exercises included in that session. */
export interface TrainingSession {
	id: string;
	version: string;
	completedAt: string;
	exercises: SessionExercise[];
}

/** Represents the definition of an exercise parsed from a YAML file.
 * @param name name of the exercise
 * @param steps array of ordered steps
 */
export interface ExerciseDefinition {
	name: string;
	steps: {
		description: string;
		completed?: boolean;
		// TODO: add completedAt in the YAML file
		// completedAt: Date
	}[];
}
