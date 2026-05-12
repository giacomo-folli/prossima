import { writable } from "svelte/store";
import type { TrainingSession, SessionExercise } from "../types/exercise";
import { loadSessions, saveSessions } from "../utils/storage";
import { hashString } from "$lib/utils/hash";

function createSessionsStore() {
	const initial = loadSessions() ?? [];
	const { subscribe, update } = writable<TrainingSession[]>(initial);

	return {
		subscribe,

		async logSession(exercises: SessionExercise[]) {
			const stringId = exercises
				.map((e) => e.exerciseName + ":" + e.stepLabel)
				.join("||");
			const hash = await hashString(stringId);

			const session: TrainingSession = {
				id: crypto.randomUUID(),
				completedAt: new Date().toISOString(),
				version: hash,
				exercises,
			};
			update((sessions) => {
				const next = [session, ...sessions];
				saveSessions(next);
				return next;
			});
		},

		deleteSession(id: string) {
			update((sessions) => {
				const next = sessions.filter((s) => s.id !== id);
				saveSessions(next);
				return next;
			});
		},
	};
}

export const sessions = createSessionsStore();
