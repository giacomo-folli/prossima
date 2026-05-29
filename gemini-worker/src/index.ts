import { GoogleGenAI } from "@google/genai";

export interface Env {
	GEMINI_API_KEY?: string;
}

const ALLOWED_ORIGIN_PATTERNS = [
	/^https?:\/\/localhost(:\d+)?$/,
	/^https:\/\/[^/]+\.github\.io$/
];

function getCorsHeaders(request: Request): HeadersInit {
	const origin = request.headers.get("Origin");
	let allowedOrigin = "";

	if (origin) {
		const isAllowed = ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));
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

async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	delayMs = 1000
): Promise<T> {
	let lastError: any;
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (err: any) {
			lastError = err;

			const errStr = String(err).toLowerCase();
			const isRetryable =
				errStr.includes("503") ||
				errStr.includes("429") ||
				errStr.includes("busy") ||
				errStr.includes("demand") ||
				errStr.includes("temporarily") ||
				errStr.includes("unavailable");

			if (!isRetryable || attempt === maxRetries) {
				throw err;
			}

			const backoffDelay = delayMs * Math.pow(2, attempt - 1);
			await new Promise((resolve) => setTimeout(resolve, backoffDelay));
		}
	}
	throw lastError;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		// Handle CORS Preflight request
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: getCorsHeaders(request),
			});
		}

		const url = new URL(request.url);

		// Route validation
		if (url.pathname !== "/api/gemini") {
			return new Response(JSON.stringify({
				error: { message: `Path not found: ${url.pathname}`, status: 404 }
			}), {
				status: 404,
				headers: {
					...getCorsHeaders(request),
					"Content-Type": "application/json"
				}
			});
		}

		// Method validation
		if (request.method !== "POST") {
			return new Response(JSON.stringify({
				error: { message: `Method not allowed: ${request.method}`, status: 405 }
			}), {
				status: 405,
				headers: {
					...getCorsHeaders(request),
					"Content-Type": "application/json"
				}
			});
		}

		// Parse body
		let body: any;
		try {
			body = await request.json();
		} catch (e) {
			return new Response(JSON.stringify({
				error: { message: "Invalid JSON body", status: 400 }
			}), {
				status: 400,
				headers: {
					...getCorsHeaders(request),
					"Content-Type": "application/json"
				}
			});
		}

		const { prompt, history, stream, temperature, maxOutputTokens, responseMimeType } = body;

		// Parameter validation
		if (typeof prompt !== "string" && !Array.isArray(history)) {
			return new Response(JSON.stringify({
				error: { message: "Missing 'prompt' or 'history' in request body", status: 400 }
			}), {
				status: 400,
				headers: {
					...getCorsHeaders(request),
					"Content-Type": "application/json"
				}
			});
		}

		// Check for API key
		const apiKey = env.GEMINI_API_KEY;
		if (!apiKey) {
			return new Response(JSON.stringify({
				error: { message: "GEMINI_API_KEY is not configured in the Cloudflare Worker environment.", status: 500 }
			}), {
				status: 500,
				headers: {
					...getCorsHeaders(request),
					"Content-Type": "application/json"
				}
			});
		}

		const ai = new GoogleGenAI({ apiKey });

		// Prepare contents structure
		let contents: any;
		if (Array.isArray(history) && history.length > 0) {
			contents = history.map((item: any) => ({
				role: item.role === "user" ? "user" : "model",
				parts: [{ text: item.content }]
			}));
			if (prompt) {
				contents.push({
					role: "user",
					parts: [{ text: prompt }]
				});
			}
		} else {
			contents = prompt;
		}

		const config = {
			temperature: typeof temperature === "number" ? temperature : 0.7,
			maxOutputTokens: typeof maxOutputTokens === "number" ? maxOutputTokens : undefined,
			responseMimeType: typeof responseMimeType === "string" ? responseMimeType : undefined,
		};

		// ── Streaming Path ────────────────────────────────────────────────────────
		if (stream === true) {
			try {
				const responseStream = await ai.models.generateContentStream({
					model: "gemini-2.5-flash",
					contents,
					config,
				});

				const headers = new Headers(getCorsHeaders(request));
				headers.set("Content-Type", "text/event-stream");
				headers.set("Cache-Control", "no-cache");
				headers.set("Connection", "keep-alive");

				const { readable, writable } = new TransformStream();
				const writer = writable.getWriter();
				const encoder = new TextEncoder();

				// Process the stream asynchronously in the worker context
				ctx.waitUntil((async () => {
					try {
						for await (const chunk of responseStream) {
							const text = chunk.text;
							if (text) {
								const sseData = `data: ${JSON.stringify({ text })}\n\n`;
								await writer.write(encoder.encode(sseData));
							}
						}
					} catch (err: any) {
						const errorMsg = err instanceof Error ? err.message : String(err);
						const sseError = `data: ${JSON.stringify({ error: { message: errorMsg } })}\n\n`;
						await writer.write(encoder.encode(sseError));
					} finally {
						await writer.close();
					}
				})());

				return new Response(readable, {
					status: 200,
					headers,
				});
			} catch (err: any) {
				const errorMsg = err instanceof Error ? err.message : String(err);
				return new Response(JSON.stringify({
					error: { message: `Streaming initialization failed: ${errorMsg}`, status: 500 }
				}), {
					status: 500,
					headers: {
						...getCorsHeaders(request),
						"Content-Type": "application/json"
					}
				});
			}
		}

		// ── Standard Non-Streaming Path ───────────────────────────────────────────
		try {
			const response = await retryWithBackoff(async () => {
				return await ai.models.generateContent({
					model: "gemini-2.0-flash-lite",
					contents,
					config,
				});
			}, 3, 3000);

			return new Response(JSON.stringify({
				text: response.text ?? ""
			}), {
				status: 200,
				headers: {
					...getCorsHeaders(request),
					"Content-Type": "application/json"
				}
			});
		} catch (err: any) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			return new Response(JSON.stringify({
				error: { message: `Gemini API call failed: ${errorMsg}`, status: 500 }
			}), {
				status: 500,
				headers: {
					...getCorsHeaders(request),
					"Content-Type": "application/json"
				}
			});
		}
	}
};
