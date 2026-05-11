import type { Exercise } from '../types/exercise';

const STORAGE_KEY = 'progression-tracker-v1';

export function loadFromStorage(): Exercise[] | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as Exercise[];
	} catch {
		return null;
	}
}

export function saveToStorage(exercises: Exercise[]): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
	} catch {
		// ignore
	}
}

export function clearStorage(): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.removeItem(STORAGE_KEY);
}
