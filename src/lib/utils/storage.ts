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
