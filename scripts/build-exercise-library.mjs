// Genera static/exercise-library.json a partire dal dataset pubblico
// hasaneyldrm/exercises-dataset. Da lanciare una tantum / all'aggiornamento del dataset:
//
//   node scripts/build-exercise-library.mjs
//
// Conserva solo le istruzioni italiane (fallback inglese) per contenere la dimensione e
// ricostruisce URL raw GitHub completi per immagine e gif (hotlink: nessun media viene copiato).
// I media sono © Gym Visual: il campo `attribution` viene mantenuto per ogni record.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const REPO_RAW_BASE =
	"https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";
const SOURCE_URL = `${REPO_RAW_BASE}data/exercises.json`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "../static/exercise-library.json");

/** Costruisce un URL raw GitHub assoluto da un path relativo del dataset. */
function mediaUrl(relativePath) {
	if (!relativePath) return "";
	return `${REPO_RAW_BASE}${relativePath.replace(/^\/+/, "")}`;
}

/** Estrae gli step italiani (fallback inglese) come array di stringhe. */
function italianSteps(record) {
	const steps = record.instruction_steps ?? {};
	const list = steps.it ?? steps.en ?? [];
	if (Array.isArray(list)) return list.map((s) => String(s).trim()).filter(Boolean);
	// Fallback: istruzione come paragrafo unico
	const paragraph = record.instructions?.it ?? record.instructions?.en ?? "";
	return String(paragraph)
		.split(/(?<=\.)\s+/)
		.map((s) => s.trim())
		.filter(Boolean);
}

async function main() {
	console.log(`→ Download dataset da ${SOURCE_URL}`);
	const res = await fetch(SOURCE_URL);
	if (!res.ok) {
		throw new Error(`Download fallito: HTTP ${res.status} ${res.statusText}`);
	}
	const raw = await res.json();
	const records = Array.isArray(raw) ? raw : (raw.exercises ?? Object.values(raw));
	console.log(`→ Record trovati: ${records.length}`);

	const library = records.map((r) => ({
		id: r.id,
		name: r.name,
		category: r.category,
		equipment: r.equipment,
		target: r.target,
		muscle_group: r.muscle_group || undefined,
		secondary_muscles: Array.isArray(r.secondary_muscles)
			? r.secondary_muscles
			: undefined,
		instructions: italianSteps(r),
		image_url: mediaUrl(r.image),
		gif_url: mediaUrl(r.gif_url),
		attribution: r.attribution ?? "© Gym Visual — https://gymvisual.com/",
	}));

	await writeFile(OUTPUT_PATH, JSON.stringify(library), "utf8");
	const bytes = Buffer.byteLength(JSON.stringify(library));
	console.log(
		`✓ Scritti ${library.length} esercizi in ${OUTPUT_PATH} (${(bytes / 1024 / 1024).toFixed(2)} MB)`,
	);
}

main().catch((err) => {
	console.error("✗ Errore:", err.message);
	process.exit(1);
});
