/**
 * groq.ts
 * Service layer for Groq API communication via a secure Cloudflare Worker proxy.
 *
 * Set VITE_GROQ_WORKER_URL in your .env or .env.local file.
 */

import type { Exercise } from "$lib/types";
import { DEFAULT_TEMPERATURE } from "$lib/constants";
import {
	SUGGEST_EXERCISE_SYSTEM_PROMPT,
	getSuggestExerciseUserPrompt,
	getProgressFeedbackPrompt,
	getWeeklyTipPrompt,
} from "$lib/constants/prompts";

// ── Client ────────────────────────────────────────────────────────────────────

const workerUrl = import.meta.env.VITE_GROQ_WORKER_URL as string;
if (!workerUrl) {
	throw new Error(
		"Missing VITE_GROQ_WORKER_URL. Add it to your .env or .env.local file.",
	);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

export interface GenerateOptions {
	model?: string;
	temperature?: number;
	maxOutputTokens?: number;
	responseFormat?: any;
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
	const response = await fetch(`${workerUrl}/api/groq`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt,
			model: options.model,
			temperature: options.temperature,
			maxOutputTokens: options.maxOutputTokens,
			responseFormat: options.responseFormat,
		}),
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(
			errData.error?.message ||
				`HTTP ${response.status}: Failed to generate text`,
		);
	}

	const data = (await response.json()) as { text: string };
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
	const response = await fetch(`${workerUrl}/api/groq`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			history: messages,
			model: options.model,
			temperature: options.temperature,
			maxOutputTokens: options.maxOutputTokens,
			responseFormat: options.responseFormat,
		}),
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(
			errData.error?.message ||
				`HTTP ${response.status}: Failed to generate chat response`,
		);
	}

	const data = (await response.json()) as { text: string };
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
	const response = await fetch(`${workerUrl}/api/groq`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt,
			stream: true,
			model: options.model,
			temperature: options.temperature,
			maxOutputTokens: options.maxOutputTokens,
			responseFormat: options.responseFormat,
		}),
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => ({}));
		throw new Error(
			errData.error?.message ||
				`HTTP ${response.status}: Failed to stream text`,
		);
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
					if (dataStr === "[DONE]") {
						return;
					}
					try {
						const parsed = JSON.parse(dataStr);
						if (parsed.error) {
							throw new Error(parsed.error.message);
						}
						// OpenAI/Groq SSE chunk format: choices[0].delta.content
						const content = parsed.choices?.[0]?.delta?.content;
						if (content) {
							yield content;
						}
					} catch (e) {
						if (
							e instanceof Error &&
							e.message &&
							!e.message.startsWith("Unexpected end")
						) {
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
	name: string,
	goal?: string,
	currentLevel?: string,
): Promise<ExerciseSuggestion | null> {
	const systemPrompt = `${SUGGEST_EXERCISE_SYSTEM_PROMPT}

IMPORTANT: You must return a valid JSON object matching this schema:
{
  "name": "Refined exercise name",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "rationale": "One-sentence coaching rationale"
}`;
	const userPrompt = getSuggestExerciseUserPrompt(name, goal, currentLevel);

	try {
		const raw = await generateText(`${systemPrompt}\n\nUser: ${userPrompt}`, {
			temperature: 0.5,
			maxOutputTokens: 1024,
			responseFormat: { type: "json_object" },
		});

		let cleanRaw = raw.trim();

		// Extract JSON object if wrapped in conversational text or markdown code blocks
		const firstBrace = cleanRaw.indexOf("{");
		const lastBrace = cleanRaw.lastIndexOf("}");
		if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
			cleanRaw = cleanRaw.substring(firstBrace, lastBrace + 1);
		}

		try {
			return JSON.parse(cleanRaw) as ExerciseSuggestion;
		} catch (parseErr) {
			console.error("groq.suggestExercise: JSON parse failed. Raw response:", raw);
			console.error("Cleaned response tried to parse:", cleanRaw);
			throw parseErr;
		}
	} catch (err) {
		console.error("groq.suggestExercise: failed to parse response", err);
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

	const prompt = getProgressFeedbackPrompt(exercise.name, completedCount, total, pct, isComplete);

	return generateText(prompt, { temperature: 0.9, maxOutputTokens: 128 });
}

/**
 * Analyses a list of exercises and returns a plain-text weekly training tip.
 */
export async function generateWeeklyTip(
	exercises: Exercise[],
): Promise<string> {
	const names = exercises.map((e) => e.name).join(", ");

	const prompt = getWeeklyTipPrompt(names);

	return generateText(prompt, { temperature: DEFAULT_TEMPERATURE, maxOutputTokens: 256 });
}
