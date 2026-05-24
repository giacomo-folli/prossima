import { writable } from "svelte/store";
import type { Exercise, TrainingSession } from "../types";
import {
	clearTrainingSessions,
	deleteTrainingSession,
	insertTrainingSession,
	loadTrainingSessions,
	updateTrainingSession,
} from "../utils/storage";
import { supabase } from "$lib/supabase";

function createSessionsStore() {
	const { subscribe, update, set } = writable<TrainingSession[]>([]);
	let initialized = false;

	return {
		subscribe,

		async init() {
			if (initialized) return;
			const data = await loadTrainingSessions();
			if (data) set(data);
			initialized = true;
		},

		async logSession(exercises: Exercise[]) {
			const row = await insertTrainingSession(exercises);
			if (row) {
				update((sessions) => [row, ...sessions]);
				return;
			}

			const session: TrainingSession = {
				completed_at: new Date().toISOString(),
				exercises,
			};
			update((sessions) => [session, ...sessions]);
		},

		async updateSession(
			id: string,
			patch: Partial<Omit<TrainingSession, "id" | "user_id">>,
		) {
			const updated = await updateTrainingSession(id, patch);
			update((sessions) =>
				sessions.map((s) =>
					s.id === id ? { ...s, ...(updated ?? patch) } : s,
				),
			);
		},

		async deleteSession(id: string) {
			if (id) await deleteTrainingSession(id);
			update((sessions) => sessions.filter((s) => s.id !== id));
		},

		async clearSessions() {
			await clearTrainingSessions();
			set([]);
		},
	};
}

export const sessions = createSessionsStore();
