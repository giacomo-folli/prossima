import type { Exercise, TrainingSession } from "../types/exercise";

const STORAGE_KEY = "progression-tracker-v1";
const SESSIONS_KEY = "progression-tracker-sessions-v1";

export function loadExercises(): Exercise[] | null {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as Exercise[];
	} catch {
		return null;
	}
}

export function saveExercises(exercises: Exercise[]): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
	} catch {
		// ignore
	}
}

export function clearStorage(): void {
	if (typeof localStorage === "undefined") return;
	localStorage.removeItem(STORAGE_KEY);
}

export function loadSessions(): TrainingSession[] | null {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(SESSIONS_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as TrainingSession[];
	} catch {
		return null;
	}
}

export function saveSessions(sessions: TrainingSession[]): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
	} catch {
		// ignore
	}
}
