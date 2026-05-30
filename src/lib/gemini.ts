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
	throw new Error(
		"Missing VITE_GEMINI_WORKER_URL. Add it to your .env or .env.local file.",
	);
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
	responseMimeType?: string;
	responseSchema?: any;
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
			model: options.model,
			temperature: options.temperature,
			maxOutputTokens: options.maxOutputTokens,
			responseMimeType: options.responseMimeType,
			responseSchema: options.responseSchema,
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
	const response = await fetch(`${workerUrl}/api/gemini`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			history: messages,
			model: options.model,
			temperature: options.temperature,
			maxOutputTokens: options.maxOutputTokens,
			responseMimeType: options.responseMimeType,
			responseSchema: options.responseSchema,
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
	const response = await fetch(`${workerUrl}/api/gemini`, {
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
			responseSchema: options.responseSchema,
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
					try {
						const parsed = JSON.parse(dataStr);
						if (parsed.error) {
							throw new Error(parsed.error.message);
						}
						if (parsed.text) {
							yield parsed.text;
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
	const systemPrompt = `
You are an expert personal trainer. Design a progressive overload workout plan for the given exercise name, tailoring the steps specifically to the user's starting baseline (current level) and ultimate goal.
Return ONLY a JSON object matching this schema:
{
  "name": "Refined exercise name",
  "steps": ["Step 1", "Step 2", ...],
  "rationale": "One-sentence coaching rationale"
}
Requirements:
1. Generate between 3 to 6 steps.
2. Steps must represent a progression timeline. The first step MUST be at or near their current level / baseline. Each subsequent step must slightly increase the difficulty (e.g. adding weight, reps, sets, or duration) progressively moving towards or achieving the specified goal.
3. Keep steps extremely concise and measurable. Use this exact format:
   - "3 sets of 10 reps (40 kg)"
   - "3 sets of 12 reps (40 kg)"
   - "3 sets of 10 reps (44 kg)"
   - Or "3 sets of 1 min (Hold plank)"
`.trim();

	let userPrompt = `Exercise Name: ${name}`;
	if (goal) {
		userPrompt += `\nGoal / Target: ${goal}`;
	}
	if (currentLevel) {
		userPrompt += `\nCurrent Baseline / Level: ${currentLevel}`;
	}

	try {
		const raw = await generateText(`${systemPrompt}\n\nUser: ${userPrompt}`, {
			temperature: 0.5,
			maxOutputTokens: 1024,
			responseMimeType: "application/json",
			responseSchema: {
				type: "OBJECT",
				properties: {
					name: {
						type: "STRING",
						description: "Refined exercise name",
					},
					steps: {
						type: "ARRAY",
						items: {
							type: "STRING",
						},
						description: "3 to 6 progressive overload steps, representing a progression timeline from the user's current baseline to their goal",
					},
					rationale: {
						type: "STRING",
						description: "One-sentence coaching rationale",
					},
				},
				required: ["name", "steps", "rationale"],
			},
		});

		let cleanRaw = raw.trim();
		if (cleanRaw.startsWith("```")) {
			cleanRaw = cleanRaw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
		}

		return JSON.parse(cleanRaw) as ExerciseSuggestion;
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
