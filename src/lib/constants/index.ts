import { GroqModel } from "./enums";

export * from "./enums";

export const DEFAULT_GROQ_MODEL = GroqModel.LLAMA_3_1_8B_INSTANT;
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_OUTPUT_TOKENS = 1024;

// --- Catalogo esercizi (dataset hasaneyldrm/exercises-dataset) ---

/** Base per gli URL raw dei media del dataset (hotlink, © Gym Visual). */
export const EXERCISE_DATASET_RAW_BASE =
	"https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/";

/** Etichette italiane per le 10 categorie (parti del corpo) del dataset. */
export const EXERCISE_CATEGORY_LABELS_IT: Record<string, string> = {
	waist: "Addome",
	"upper legs": "Gambe (parte alta)",
	back: "Schiena",
	"lower legs": "Gambe (parte bassa)",
	chest: "Petto",
	"upper arms": "Braccia (parte alta)",
	cardio: "Cardio",
	shoulders: "Spalle",
	"lower arms": "Braccia (parte bassa)",
	neck: "Collo",
};
