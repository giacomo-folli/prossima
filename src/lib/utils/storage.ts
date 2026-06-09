import type { Exercise, TrainingSession, UserProfile } from "../types";
import { supabase } from "$lib/supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Loads all exercises along with their nested, ordered steps from Supabase.
 * Returns null if an error occurs or if no user session is active.
 */
export async function loadExercises(): Promise<Exercise[] | null> {
	try {
		const { data, error } = await supabase
			.from("exercises")
			.select(
				`id, name, icon, type, current_step_index, steps (id, description, completed, completed_at, step_index)`,
			)
			.order("step_index", { referencedTable: "steps" });

		if (error) {
			console.error("Supabase error while loading exercises:", error.message);
			return null;
		}

		if (!data) return null;
		return data as Exercise[];
	} catch (catchError) {
		console.error("Unexpected runtime failure loading exercises:", catchError);
		return null;
	}
}

/**
 * Updates the active step index for a specific exercise.
 * Useful when a user increments or decrements their current position.
 */
export async function updateExerciseProgress(
	exerciseId: string,
	next_step_index: number,
): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("exercises")
			.update({ current_step_index: next_step_index })
			.eq("id", exerciseId);

		if (error) {
			console.error(
				`Failed to update progress for exercise ${exerciseId}:`,
				error.message,
			);
			return false;
		}
		return true;
	} catch (err) {
		console.error("Runtime error in updateExerciseProgress:", err);
		return false;
	}
}

/**
 * Saves a single step's completion status and its timestamp.
 * Call this immediately when a user checks/unchecks a specific step.
 */
export async function updateStepCompletion(
	stepId: string,
	completed: boolean,
	completedAt?: string | null,
): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("steps")
			.update({
				completed,
				completed_at: completed
					? completedAt || new Date().toISOString()
					: null,
			})
			.eq("id", stepId);

		if (error) {
			console.error(`Failed to update step ${stepId}:`, error.message);
			return false;
		}
		return true;
	} catch (err) {
		console.error("Runtime error in updateStepCompletion:", err);
		return false;
	}
}

export async function loadTrainingSessions(): Promise<
	TrainingSession[] | null
> {
	try {
		const { data, error } = await supabase
			.from("training_sessions")
			.select("id, completed_at, exercises, notes, liked")
			.order("completed_at", { ascending: false });

		if (error) {
			console.error("Supabase error loading training sessions:", error.message);
			return null;
		}

		return (data ?? []) as TrainingSession[];
	} catch (err) {
		console.error("Unexpected failure loading training sessions:", err);
		return null;
	}
}

export async function insertTrainingSession(
	exercises: Exercise[],
): Promise<TrainingSession | null> {
	try {
		const { data, error } = await supabase
			.from("training_sessions")
			.insert({ exercises })
			.select("id, completed_at, exercises")
			.single();

		if (error) {
			console.error("Failed to insert training session:", error.message);
			return null;
		}

		return data as TrainingSession;
	} catch (err) {
		console.error("Unexpected failure inserting training session:", err);
		return null;
	}
}

export async function deleteTrainingSession(id: string): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("training_sessions")
			.delete()
			.eq("id", id);

		if (error) {
			console.error(`Failed to delete session ${id}:`, error.message);
			return false;
		}
		return true;
	} catch (err) {
		console.error("Unexpected failure deleting training session:", err);
		return false;
	}
}

export async function clearTrainingSessions(): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("training_sessions")
			.delete()
			.gte("completed_at", "1970-01-01T00:00:00Z");

		if (error) {
			console.error("Failed to clear training sessions:", error.message);
			return false;
		}
		return true;
	} catch (err) {
		console.error("Unexpected failure clearing training sessions:", err);
		return false;
	}
}

export async function loadUser(): Promise<UserProfile | null> {
	try {
		const { data, error } = await supabase
			.from("profiles")
			.select("id, display_name, full_name, avatar_url")
			.single();

		if (error) {
			console.error("Supabase error loading user profile:", error.message);
			return null;
		}

		return (data ?? null) as UserProfile;
	} catch (err) {
		console.error("Unexpected failure loading training sessions:", err);
		return null;
	}
}

export async function updateUserProfile(
	profile: Partial<UserProfile>,
): Promise<UserProfile | null> {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			console.error("No active session to update profile");
			return null;
		}

		const { data, error } = await supabase
			.from("profiles")
			.update(profile)
			.eq("id", user.id)
			.select("id, display_name, full_name, avatar_url")
			.single();

		if (error) {
			console.error("Supabase error updating user profile:", error.message);
			return null;
		}

		return (data ?? null) as UserProfile;
	} catch (err) {
		console.error("Unexpected failure updating user profile:", err);
		return null;
	}
}

// src/lib/utils/storage.ts
export async function updateTrainingSession(
	id: string,
	patch: Partial<Omit<TrainingSession, "id" | "user_id">>,
): Promise<TrainingSession | null> {
	const { data, error } = await supabase
		.from("training_sessions")
		.update(patch)
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error("updateTrainingSession:", error.message);
		return null;
	}
	return data as TrainingSession;
}

/**
 * Inserts a new exercise and its ordered steps into Supabase.
 * Steps are created in the order provided, with step_index assigned automatically.
 * Returns the full exercise with steps, or null on failure.
 */
export async function insertExercise(
	name: string,
	stepDescriptions: string[],
): Promise<Exercise | null> {
	try {
		const { data: exercise, error: exerciseError } = await supabase
			.from("exercises")
			.insert({ name, type: "exercise", current_step_index: 0 })
			.select("id, name, icon, type, current_step_index")
			.single();

		if (exerciseError || !exercise) {
			console.error("Failed to insert exercise:", exerciseError?.message);
			return null;
		}

		const steps = stepDescriptions.map((description, i) => ({
			exercise_id: exercise.id,
			description,
			step_index: i,
			completed: false,
		}));

		const { error: stepsError } = await supabase.from("steps").insert(steps);

		if (stepsError) {
			console.error("Failed to insert steps:", stepsError.message);
			// Roll back the orphaned exercise
			await supabase.from("exercises").delete().eq("id", exercise.id);
			return null;
		}

		// Return a fresh load so steps are shaped exactly like the rest of the store
		const full = await loadExercises();
		return full?.find((e) => e.id === exercise.id) ?? null;
	} catch (err) {
		console.error("Unexpected failure inserting exercise:", err);
		return null;
	}
}

export async function removeExercise(exerciseId: string): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("exercises")
			.delete()
			.eq("id", exerciseId);

		if (error) {
			console.error("Failed to delete exercise:", error.message);
			return false;
		}

		return true;
	} catch (error) {
		console.error("Unexpected failure inserting exercise:", error);
		return false;
	}
}

/**
 * Updates exercise data (name, active step index) and its associated steps (adding, updating, or deleting).
 */
export async function updateExerciseInDB(
	exerciseId: string,
	name: string,
	steps: Array<{ id?: string; description: string; step_index: number; completed: boolean; completed_at?: string }>,
): Promise<boolean> {
	try {
		// 1. Fetch current steps to find which ones were deleted
		const { data: existingStepsData, error: fetchError } = await supabase
			.from("steps")
			.select("id")
			.eq("exercise_id", exerciseId);

		if (fetchError) {
			console.error("Failed to fetch existing steps:", fetchError.message);
			return false;
		}

		const existingStepIds = (existingStepsData ?? []).map((s) => s.id);
		const updatedStepIds = steps.map((s) => s.id).filter(Boolean) as string[];

		const stepIdsToDelete = existingStepIds.filter((id) => !updatedStepIds.includes(id));
		if (stepIdsToDelete.length > 0) {
			const { error: deleteError } = await supabase
				.from("steps")
				.delete()
				.in("id", stepIdsToDelete);
			if (deleteError) {
				console.error("Failed to delete steps:", deleteError.message);
				return false;
			}
		}

		// 2. Fetch the exercise to inspect current_step_index
		const { data: exerciseData, error: exFetchError } = await supabase
			.from("exercises")
			.select("current_step_index")
			.eq("id", exerciseId)
			.single();

		if (exFetchError || !exerciseData) {
			console.error("Failed to fetch exercise current_step_index:", exFetchError?.message);
			return false;
		}

		let nextIndex = exerciseData.current_step_index ?? 0;
		const newTotalSteps = steps.length;
		if (nextIndex >= newTotalSteps) {
			nextIndex = Math.max(0, newTotalSteps - 1);
		}

		// 3. Update the exercise name and current_step_index
		const { error: exUpdateError } = await supabase
			.from("exercises")
			.update({ name, current_step_index: nextIndex })
			.eq("id", exerciseId);

		if (exUpdateError) {
			console.error("Failed to update exercise name and progress:", exUpdateError.message);
			return false;
		}

		// 4. Upsert steps
		if (steps.length > 0) {
			const stepsToUpsert = steps.map((s) => ({
				id: s.id || crypto.randomUUID(),
				exercise_id: exerciseId,
				description: s.description,
				step_index: s.step_index,
				completed: s.completed,
				completed_at: s.completed ? s.completed_at || new Date().toISOString() : null,
			}));

			const { error: upsertError } = await supabase
				.from("steps")
				.upsert(stepsToUpsert);

			if (upsertError) {
				console.error("Failed to upsert steps:", upsertError.message);
				return false;
			}
		}

		return true;
	} catch (err) {
		console.error("Unexpected failure in updateExerciseInDB:", err);
		return false;
	}
}

