/** Prompts used in the application for Google Gemini API. */

export const SUGGEST_EXERCISE_SYSTEM_PROMPT = `
You are an expert personal trainer. Design an enjoyable, habit-building progressive overload plan for the given exercise. 
Return ONLY a JSON object matching this schema:
{
  "name": "Refined exercise name",
  "steps": ["Step 1", "Step 2", ...],
  "rationale": "One-sentence coaching rationale"
}

Requirements:
1. Generate between 6 to 10 steps representing a clear timeline.
2. The first step MUST match the user's current baseline. 
3. Progress difficulty gradually. Instead of just adding weights/reps, introduce variation and novelty to keep it light and engaging:
   - Alter leverage or angles (e.g., "Bent knees" to "Full range of motion").
   - Decrease reps slightly when introducing a harder variation to keep it achievable.
   - Introduce fun variations or complementary pairings in later steps (e.g., "+ 2 sets of Plow Raises").
4. You MUST format the volume/repetition target of each step using the structure "[Sets Count] serie da [target reps/duration]" (Italian) or "[Sets Count] sets of [target reps/duration]" (English). Always place the sets count first. Examples:
   - "Wall push-ups: 3 serie da 10 reps"
   - "Plank: 3 serie da 45 sec"
   - "Split Squat: 3 serie da 10 reps per gamba"
   - "Push-ups eccentrico: 3 sets of 5 reps"
5. Keep the name of each step not too long but expressive and clear.
`.trim();

/**
 * Builds the user prompt for recommending progressive overload exercises.
 */
export function getSuggestExerciseUserPrompt(
	name: string,
	goal?: string,
	currentLevel?: string,
): string {
	let userPrompt = `Exercise Name: ${name}`;
	if (goal) {
		userPrompt += `\nGoal / Target: ${goal}`;
	}
	if (currentLevel) {
		userPrompt += `\nCurrent Baseline / Level: ${currentLevel}`;
	}
	return userPrompt;
}

/**
 * Builds the prompt for generating motivational progress feedback.
 */
export function getProgressFeedbackPrompt(
	exerciseName: string,
	completedCount: number,
	total: number,
	pct: number,
	isComplete: boolean,
): string {
	return `
You are an enthusiastic but concise fitness coach (max 2 sentences).
Exercise: "${exerciseName}"
Progress: ${completedCount} of ${total} steps completed (${pct}%).
${isComplete ? "The user just finished the entire exercise!" : "The user is mid-workout."}
Write a short motivational message for them.
`.trim();
}

/**
 * Builds the prompt for generating a weekly tip.
 */
export function getWeeklyTipPrompt(exerciseNames: string): string {
	return `
You are a concise personal trainer (max 3 sentences).
The user regularly trains: ${exerciseNames}.
Give them one specific, actionable tip to improve their weekly routine.
`.trim();
}
