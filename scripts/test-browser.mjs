import { execFileSync, spawnSync } from "node:child_process";

// Read the running disposable stack's keys: publishable keys can change on a
// fresh CI machine. Never read credentials from a linked/production project.
const local = JSON.parse(execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
	encoding: "utf8",
	stdio: ["ignore", "pipe", "inherit"],
}));
if (local.API_URL !== "http://127.0.0.1:54321" || !local.ANON_KEY || !local.SERVICE_ROLE_KEY) {
	throw new Error("Browser tests require the local Supabase stack. Run pnpm db:start first.");
}

const result = spawnSync("pnpm", ["exec", "playwright", "test", ...process.argv.slice(2)], {
	stdio: "inherit",
	env: {
		...process.env,
		PUBLIC_SUPABASE_URL: local.API_URL,
		PUBLIC_SUPABASE_ANON_KEY: local.ANON_KEY,
		SUPABASE_TEST_SERVICE_ROLE_KEY: local.SERVICE_ROLE_KEY,
		PUBLIC_POSTHOG_PROJECT_TOKEN: "test-disabled",
		PUBLIC_POSTHOG_HOST: "http://127.0.0.1:9",
		VITE_GROQ_WORKER_URL: "http://127.0.0.1:9",
	},
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
