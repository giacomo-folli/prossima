export interface Step {
	id: string;
	label: string;
	completed: boolean;
	completedAt?: string;
}

export interface Exercise {
	id: string;
	name: string;
	steps: Step[];
	currentStepIndex: number;
}
