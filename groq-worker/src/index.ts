export interface Env {
	GROQ_API_KEY?: string;
}

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

async function retryWithBackoff<T>({
	fn,
	maxRetries = 2,
	delayMs = 2000,
}: {
	fn: () => Promise<T>;
	maxRetries?: number;
	delayMs: number;
}): Promise<T> {
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
		ctx: ExecutionContext,
	): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: getCorsHeaders(request),
			});
		}

		const url = new URL(request.url);

		if (url.pathname !== "/api/groq") {
			return new Response(
				JSON.stringify({
					error: { message: `Path not found: ${url.pathname}`, status: 404 },
				}),
				{
					status: 404,
					headers: {
						...getCorsHeaders(request),
						"Content-Type": "application/json",
					},
				},
			);
		}

		if (request.method !== "POST") {
			return new Response(
				JSON.stringify({
					error: {
						message: `Method not allowed: ${request.method}`,
						status: 405,
					},
				}),
				{
					status: 405,
					headers: {
						...getCorsHeaders(request),
						"Content-Type": "application/json",
					},
				},
			);
		}

		let body: any;
		try {
			body = await request.json();
		} catch (e) {
			return new Response(
				JSON.stringify({
					error: { message: "Invalid JSON body", status: 400 },
				}),
				{
					status: 400,
					headers: {
						...getCorsHeaders(request),
						"Content-Type": "application/json",
					},
				},
			);
		}

		const {
			prompt,
			history,
			stream,
			temperature,
			maxOutputTokens,
			responseFormat,
			model,
		} = body;

		if (typeof prompt !== "string" && !Array.isArray(history)) {
			return new Response(
				JSON.stringify({
					error: {
						message: "Missing 'prompt' or 'history' in request body",
						status: 400,
					},
				}),
				{
					status: 400,
					headers: {
						...getCorsHeaders(request),
						"Content-Type": "application/json",
					},
				},
			);
		}

		const apiKey = env.GROQ_API_KEY;
		if (!apiKey) {
			return new Response(
				JSON.stringify({
					error: {
						message:
							"GROQ_API_KEY is not configured in the Cloudflare Worker environment.",
						status: 500,
					},
				}),
				{
					status: 500,
					headers: {
						...getCorsHeaders(request),
						"Content-Type": "application/json",
					},
				},
			);
		}

		let messages: any[] = [];
		if (Array.isArray(history) && history.length > 0) {
			messages = history.map((item: any) => ({
				role: item.role === "user" ? "user" : "assistant",
				content: item.content,
			}));
			if (prompt) {
				messages.push({
					role: "user",
					content: prompt,
				});
			}
		} else {
			messages.push({
				role: "user",
				content: prompt,
			});
		}

		const groqModel = model || "llama-3.1-8b-instant";
		const payload: any = {
			model: groqModel,
			messages,
			temperature: typeof temperature === "number" ? temperature : 0.7,
			stream: stream === true,
		};

		if (typeof maxOutputTokens === "number") {
			payload.max_tokens = maxOutputTokens;
		}

		if (responseFormat) {
			payload.response_format = responseFormat;
		}

		try {
			const response = await retryWithBackoff({
				fn: async () => {
					const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
						method: "POST",
						headers: {
							"Authorization": `Bearer ${apiKey}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify(payload),
					});
					if (!res.ok) {
						const errData = await res.json().catch(() => ({}));
						throw new Error(errData.error?.message || `HTTP ${res.status}`);
					}
					return res;
				},
				delayMs: 3000,
			});

			// If streaming, just pipe the response back
			if (stream) {
				const headers = new Headers(getCorsHeaders(request));
				headers.set("Content-Type", "text/event-stream");
				headers.set("Cache-Control", "no-cache");
				headers.set("Connection", "keep-alive");

				return new Response(response.body, {
					status: 200,
					headers,
				});
			}

			// Non-streaming response
			const data: any = await response.json();
			return new Response(
				JSON.stringify({
					text: data.choices?.[0]?.message?.content ?? "",
				}),
				{
					status: 200,
					headers: {
						...getCorsHeaders(request),
						"Content-Type": "application/json",
					},
				},
			);
		} catch (err: any) {
			const errorMsg = err instanceof Error ? err.message : String(err);
			return new Response(
				JSON.stringify({
					error: {
						message: `Groq API call failed: ${errorMsg}`,
						status: 500,
					},
				}),
				{
					status: 500,
					headers: {
						...getCorsHeaders(request),
						"Content-Type": "application/json",
					},
				},
			);
		}
	},
};
