/**
 * gemini.ts
 * Service layer for Google Gemini API communication via @google/genai.
 *
 * Set VITE_GEMINI_API_KEY in your .env file.
 * ⚠️  For production, move calls to a SvelteKit server endpoint (+server.ts)
 *     so the API key is never exposed to the browser.
 */

import { GoogleGenAI } from "@google/genai";
import type { Exercise } from "$lib/types";

// ── Client ────────────────────────────────────────────────────────────────────

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!apiKey) {
	throw new Error("Missing VITE_GEMINI_API_KEY. Add it to your .env file.");
}

const ai = new GoogleGenAI({ apiKey });

/** Default model used across all calls unless overridden. */
const DEFAULT_MODEL = "gemini-2.5-flash";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
	role: "user" | "model";
	content: string;
}

export interface GenerateOptions {
	model?: string;
	temperature?: number;
	maxOutputTokens?: number;
}

export interface ExerciseSuggestion {
	name: string;
	steps: string[];
	rationale: string;
}

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Low-level: generate a single text response from a prompt string.
 */
export async function generateText(
	prompt: string,
	options: GenerateOptions = {},
): Promise<string> {
	const response = await ai.models.generateContent({
		model: options.model ?? DEFAULT_MODEL,
		contents: prompt,
		config: {
			temperature: options.temperature ?? 0.7,
			maxOutputTokens: options.maxOutputTokens ?? 1024,
		},
	});

	return response.text ?? "";
}

/**
 * Multi-turn chat: pass the full message history and receive the next reply.
 * Keep the returned message and append it to your history for the next call.
 */
export async function chat(
	messages: ChatMessage[],
	options: GenerateOptions = {},
): Promise<string> {
	const contents = messages.map((m) => ({
		role: m.role,
		parts: [{ text: m.content }],
	}));

	const response = await ai.models.generateContent({
		model: options.model ?? DEFAULT_MODEL,
		contents,
		config: {
			temperature: options.temperature ?? 0.7,
			maxOutputTokens: options.maxOutputTokens ?? 2048,
		},
	});

	return response.text ?? "";
}

/**
 * Streaming variant of generateText — yields text chunks as they arrive.
 * Usage:
 *   for await (const chunk of streamText("Tell me about squats")) {
 *     output += chunk;
 *   }
 */
export async function* streamText(
	prompt: string,
	options: GenerateOptions = {},
): AsyncGenerator<string> {
	const stream = await ai.models.generateContentStream({
		model: options.model ?? DEFAULT_MODEL,
		contents: prompt,
		config: {
			temperature: options.temperature ?? 0.7,
			maxOutputTokens: options.maxOutputTokens ?? 2048,
		},
	});

	for await (const chunk of stream) {
		const text = chunk.text;
		if (text) yield text;
	}
}

// ── Domain-specific helpers ───────────────────────────────────────────────────

/**
 * Suggests a structured exercise plan given a free-form user description.
 * Returns a typed object ready to pass to exercises.addExercise().
 */
export async function suggestExercise(
	userPrompt: string,
): Promise<ExerciseSuggestion | null> {
	const systemPrompt = `
You are a personal fitness coach. The user will describe a fitness goal or exercise idea.
Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text.
Schema:
{
  "name": "short exercise name",
  "steps": ["step 1 description", "step 2 description", ...],
  "rationale": "one sentence explaining why this plan suits the user"
}
Steps should be 3–7 concrete, actionable instructions.
`.trim();

	try {
		const raw = await generateText(`${systemPrompt}\n\nUser: ${userPrompt}`, {
			temperature: 0.5,
			maxOutputTokens: 512,
		});

		return JSON.parse(raw.trim()) as ExerciseSuggestion;
	} catch (err) {
		console.error("gemini.suggestExercise: failed to parse response", err);
		return null;
	}
}

/**
 * Generates motivational coaching feedback based on the user's current
 * exercise progress. Returns a short encouraging message.
 */
export async function generateProgressFeedback(
	exercise: Exercise,
	completedCount: number,
	total: number,
): Promise<string> {
	const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);
	const isComplete = completedCount === total;

	const prompt = `
You are an enthusiastic but concise fitness coach (max 2 sentences).
Exercise: "${exercise.name}"
Progress: ${completedCount} of ${total} steps completed (${pct}%).
${isComplete ? "The user just finished the entire exercise!" : "The user is mid-workout."}
Write a short motivational message for them.
`.trim();

	return generateText(prompt, { temperature: 0.9, maxOutputTokens: 128 });
}

/**
 * Analyses a list of exercises and returns a plain-text weekly training tip.
 */
export async function generateWeeklyTip(
	exercises: Exercise[],
): Promise<string> {
	const names = exercises.map((e) => e.name).join(", ");

	const prompt = `
You are a concise personal trainer (max 3 sentences).
The user regularly trains: ${names}.
Give them one specific, actionable tip to improve their weekly routine.
`.trim();

	return generateText(prompt, { temperature: 0.7, maxOutputTokens: 256 });
}
