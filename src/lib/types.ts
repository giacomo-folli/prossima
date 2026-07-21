import { ExerciseType } from "$lib/constants";

/** Represents an individual step in a training exercise. */
export interface Step {
	id: string;
	description: string;
	completed: boolean;
	completed_at?: string;
	step_index: number;
}

export interface LoggedSet {
	set_index: number;
	completed: boolean;
	reps?: number;
	weight?: number;
}

/** Represents an exercise in a training program, including
 *  its ordered steps and current progress. */
export interface Exercise {
	id: string;
	name: string;
	icon?: string;
	steps?: Step[];
	current_step_index?: number;
	type: ExerciseType;
	logged_sets?: LoggedSet[];
}

/** Represents a completed training session with metadata and the
 * exercises included in that session. */
export interface TrainingSession {
	id?: string;
	notes?: string;
	liked?: boolean;
	completed_at: string;
	exercises: Exercise[];
}

export interface UserProfile {
	id?: string;
	display_name?: string;
	full_name?: string;
	avatar_url?: string;
}

/** Esercizio del catalogo di riferimento (dataset esterno, read-only).
 *  Concetto distinto da `Exercise`: non ha progressione né appartiene all'utente,
 *  serve come template/vocabolario da cui derivare gli esercizi tracciati.
 *  Fonte: hasaneyldrm/exercises-dataset — media © Gym Visual (hotlink). */
export interface ExerciseTemplate {
	id: string;
	name: string;
	category: string; // parte del corpo (es. "waist", "chest")
	equipment: string; // es. "body weight"
	target: string; // muscolo primario
	muscle_group?: string;
	secondary_muscles?: string[];
	instructions: string[]; // step in italiano (fallback inglese)
	image_url: string; // URL raw GitHub completo (hotlink)
	gif_url: string; // URL raw GitHub completo (hotlink)
	attribution: string;
}
