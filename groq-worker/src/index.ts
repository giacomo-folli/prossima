import Groq from "groq-sdk";
import type { ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions.js";

export interface Env {
	GROQ_API_KEY?: string;
}

const DEFAULT_MODEL = "openai/gpt-oss-20b";
const DEFAULT_TEMPERATURE = 0.7;

const ALLOWED_ORIGIN_PATTERNS = [
	/^https?:\/\/localhost(:\d+)?$/,
	/^https:\/\/[^/]+\.github\.io$/,
];

function getCorsHeaders(request: Request): HeadersInit {
	const origin = request.headers.get("Origin");
	let allowedOrigin = "";

	if (origin) {
		const isAllowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) =>
			pattern.test(origin),
		);
		if (isAllowed) {
			allowedOrigin = origin;
		}
	}

	return {
		"Access-Control-Allow-Origin": allowedOrigin || "null",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Max-Age": "86400",
	};
}

function jsonResponse(
	body: Record<string, unknown>,
	status: number,
	request: Request,
): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			...getCorsHeaders(request),
			"Content-Type": "application/json",
		},
	});
}

function errorResponse(
	status: number,
	message: string,
	request: Request,
): Response {
	return jsonResponse({ error: { message, status } }, status, request);
}

export default {
	async fetch(
		request: Request,
		env: Env,
		_ctx: ExecutionContext,
	): Promise<Response> {
		// CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: getCorsHeaders(request),
			});
		}

		const apiKey = env.GROQ_API_KEY;
		if (!apiKey) {
			return errorResponse(500, "API_KEY is missing.", request);
		}

		const url = new URL(request.url);

		if (url.pathname !== "/api/groq") {
			return errorResponse(404, `Path not found: ${url.pathname}`, request);
		}

		if (request.method !== "POST") {
			return errorResponse(405, `Not allowed: ${request.method}`, request);
		}

		let body: any;
		try {
			body = await request.json();
		} catch {
			return errorResponse(400, "Invalid JSON body", request);
		}

		const {
			prompt,
			history,
			maxOutputTokens,
			responseFormat,
			// model,
			// temperature,
		} = body;

		if (typeof prompt !== "string" && !Array.isArray(history)) {
			return errorResponse(
				400,
				"Missing 'prompt' or 'history' in request body",
				request,
			);
		}

		// Build messages array
		let messages: ChatCompletionCreateParamsNonStreaming["messages"] = [];
		if (history && history.length > 0) {
			messages = history;
		}

		messages.push({ role: "user", content: prompt });

		const payload: ChatCompletionCreateParamsNonStreaming = {
			messages,
			model: DEFAULT_MODEL,
			temperature: DEFAULT_TEMPERATURE,
			max_completion_tokens:
				typeof maxOutputTokens === "number" ? maxOutputTokens : undefined,
			response_format: responseFormat ?? undefined,
		};

		try {
			const groq = new Groq({ apiKey });
			const response = await groq.chat.completions.create(payload);

			return jsonResponse(
				{ text: response.choices?.[0]?.message?.content ?? "" },
				200,
				request,
			);
		} catch (err: any) {
			const message = err?.message ?? String(err);
			return errorResponse(500, `Groq API call failed: ${message}`, request);
		}
	},
};
