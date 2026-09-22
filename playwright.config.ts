import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	workers: process.env.CI ? 2 : undefined,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [["html", { open: "never" }], ["line"]] : "list",
	use: {
		baseURL: "http://127.0.0.1:4173/prossima/",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		serviceWorkers: "block",
	},
	webServer: {
		command: "pnpm build --mode test && pnpm preview --host 127.0.0.1 --port 4173 --strictPort",
		url: "http://127.0.0.1:4173/prossima/auth",
		reuseExistingServer: false,
		timeout: 120_000,
	},
	projects: [
		{
			name: "desktop-chromium",
			testMatch: "tests/e2e/**/*.spec.ts",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "mobile-chromium",
			testMatch: "tests/e2e/**/*.spec.ts",
			use: { ...devices["Pixel 7"] },
		},
		{
			name: "mobile-small",
			testMatch: "tests/e2e/**/*.spec.ts",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 320, height: 568 },
			},
		},
		{
			name: "a11y-chromium",
			testMatch: "tests/a11y/**/*.spec.ts",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
