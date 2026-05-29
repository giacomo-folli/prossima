/**
 * gemini.ts
 * Service layer for Google Gemini API communication via a secure Cloudflare Worker proxy.
 *
 * Set VITE_GEMINI_WORKER_URL in your .env or .env.local file.
 */

import type { Exercise } from "$lib/types";

// ── Client ────────────────────────────────────────────────────────────────────

const workerUrl = import.meta.env.VITE_GEMINI_WORKER_URL as string;

if (!workerUrl) {
	throw new Error("Missing VITE_GEMINI_WORKER_URL. Add it to your .env or .env.local file.");
}

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
	const response = await fetch(`${workerUrl}/api/gemini`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt,
			temperature: options.temperature,
			maxOutputTokens: options.maxOutputTokens,
		}),
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error?.message || `HTTP ${response.status}: Failed to generate text`);
	}

	const data = await response.json() as { text: string };
	return data.text;
}

/**
 * Multi-turn chat: pass the full message history and receive the next reply.
 * Keep the returned message and append it to your history for the next call.
 */
export async function chat(
	messages: ChatMessage[],
	options: GenerateOptions = {},
): Promise<string> {
	const response = await fetch(`${workerUrl}/api/gemini`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			history: messages,
			temperature: options.temperature,
			maxOutputTokens: options.maxOutputTokens,
		}),
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error?.message || `HTTP ${response.status}: Failed to generate chat response`);
	}

	const data = await response.json() as { text: string };
	return data.text;
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
	const response = await fetch(`${workerUrl}/api/gemini`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt,
			stream: true,
			temperature: options.temperature,
			maxOutputTokens: options.maxOutputTokens,
		}),
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(errData.error?.message || `HTTP ${response.status}: Failed to stream text`);
	}

	const reader = response.body?.getReader();
	if (!reader) {
		throw new Error("Response body is not readable");
	}

	const decoder = new TextDecoder();
	let buffer = "";

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			
			// Save the incomplete line back to the buffer
			buffer = lines.pop() || "";

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;

				if (trimmed.startsWith("data: ")) {
					const dataStr = trimmed.slice(6);
					try {
						const parsed = JSON.parse(dataStr);
						if (parsed.error) {
							throw new Error(parsed.error.message);
						}
						if (parsed.text) {
							yield parsed.text;
						}
					} catch (e) {
						if (e instanceof Error && e.message && !e.message.startsWith("Unexpected end")) {
							throw e;
						}
					}
				}
			}
		}
	} finally {
		reader.releaseLock();
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

