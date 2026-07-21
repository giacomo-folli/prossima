import { base } from "$app/paths";
import type { ExerciseTemplate } from "../types";

/**
 * Accesso al catalogo di esercizi di riferimento (dataset esterno, read-only).
 * I dati risiedono in `static/exercise-library.json`, generato da
 * `scripts/build-exercise-library.mjs`. I media (image_url/gif_url) sono in hotlink
 * su raw.githubusercontent.com — © Gym Visual.
 *
 * Questa utility è la base riutilizzabile su cui costruire la futura UI
 * (libreria/autocomplete). Nessun componente la usa ancora.
 */

const LIBRARY_URL = `${base}/exercise-library.json`;

let cache: ExerciseTemplate[] | null = null;
let inflight: Promise<ExerciseTemplate[]> | null = null;

/** Carica il catalogo una sola volta, riusando la cache di modulo. */
export async function loadExerciseLibrary(): Promise<ExerciseTemplate[]> {
	if (cache) return cache;
	if (inflight) return inflight;

	inflight = (async () => {
		try {
			const res = await fetch(LIBRARY_URL);
			if (!res.ok) {
				console.error(
					`Failed to load exercise library: HTTP ${res.status} ${res.statusText}`,
				);
				return [];
			}
			cache = (await res.json()) as ExerciseTemplate[];
			return cache;
		} catch (err) {
			console.error("Unexpected failure loading exercise library:", err);
			return [];
		} finally {
			inflight = null;
		}
	})();

	return inflight;
}

/**
 * Ricerca (case-insensitive) con ranking per pertinenza:
 *   0 = il nome inizia con la query
 *   1 = una parola del nome inizia con la query
 *   2 = il nome contiene la query
 *   3 = solo target/categoria contengono la query
 * I match sul nome vengono sempre prima di quelli su target/categoria, così
 * cercando "pi" si vedono "pike push up"/"pistol squat" e non "spine"/"supine".
 */
export function searchExerciseTemplates(
	list: ExerciseTemplate[],
	query: string,
): ExerciseTemplate[] {
	const q = query.trim().toLowerCase();
	if (!q) return list;

	const scored: Array<{ t: ExerciseTemplate; score: number }> = [];
	for (const t of list) {
		const name = t.name.toLowerCase();
		let score: number;
		if (name.startsWith(q)) score = 0;
		else if (name.split(/\s+/).some((w) => w.startsWith(q))) score = 1;
		else if (name.includes(q)) score = 2;
		else if (
			t.target.toLowerCase().includes(q) ||
			t.category.toLowerCase().includes(q)
		)
			score = 3;
		else continue;
		scored.push({ t, score });
	}

	scored.sort((a, b) => a.score - b.score || a.t.name.localeCompare(b.t.name));
	return scored.map((s) => s.t);
}

/** Filtra per parte del corpo / categoria (es. "waist", "chest"). */
export function filterByCategory(
	list: ExerciseTemplate[],
	category: string,
): ExerciseTemplate[] {
	const c = category.trim().toLowerCase();
	return list.filter((t) => t.category.toLowerCase() === c);
}

/** Filtra per attrezzatura (es. "body weight", "barbell"). */
export function filterByEquipment(
	list: ExerciseTemplate[],
	equipment: string,
): ExerciseTemplate[] {
	const e = equipment.trim().toLowerCase();
	return list.filter((t) => t.equipment.toLowerCase() === e);
}

/** Elenco ordinato e deduplicato delle categorie presenti nel catalogo. */
export function listCategories(list: ExerciseTemplate[]): string[] {
	return [...new Set(list.map((t) => t.category))].sort();
}

/** Elenco ordinato e deduplicato delle attrezzature presenti nel catalogo. */
export function listEquipment(list: ExerciseTemplate[]): string[] {
	return [...new Set(list.map((t) => t.equipment))].sort();
}
