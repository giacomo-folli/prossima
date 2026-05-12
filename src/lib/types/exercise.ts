export interface Step {
	id: string;
	label: string;
	completed: boolean;
	completedAt?: string;
	exercise?: Exercise;
}

export interface Exercise {
	id: string;
	name: string;
	steps: Step[];
	currentStepIndex: number;
}

export interface SessionExercise {
	exerciseId: string;
	exerciseName: string;
	stepLabel: string;
}

export interface TrainingSession {
	id: string;
	version: string;
	completedAt: string;
	exercises: SessionExercise[];
}
