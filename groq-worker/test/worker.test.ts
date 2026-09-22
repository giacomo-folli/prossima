import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

describe("Groq worker", () => {
	it("handles a CORS preflight inside the Workers runtime", async () => {
		const response = await SELF.fetch("https://worker.test/api/groq", {
			method: "OPTIONS",
			headers: { Origin: "http://localhost:4173" },
		});

		expect(response.status).toBe(204);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
			"http://localhost:4173",
		);
	});
});
