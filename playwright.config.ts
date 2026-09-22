import { defineConfig, devices } from "@playwright/test";

const authState = "playwright/.auth/owner.json";

export default defineConfig({
	testDir: ".",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [["html", { open: "never" }], ["line"]] : "list",
	use: {
		baseURL: "http://127.0.0.1:4173",
		trace: "on-first-retry",
	},
	webServer: {
		command: "pnpm dev --mode test --host 127.0.0.1 --port 4173",
		url: "http://127.0.0.1:4173/auth",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
	projects: [
		{
			name: "auth-setup",
			testMatch: "tests/e2e/auth.setup.ts",
		},
		{
			name: "desktop-chromium",
			testMatch: "tests/e2e/**/*.spec.ts",
			use: { ...devices["Desktop Chrome"], storageState: authState },
			dependencies: ["auth-setup"],
		},
		{
			name: "mobile-chromium",
			testMatch: "tests/e2e/**/*.spec.ts",
			use: { ...devices["Pixel 7"], storageState: authState },
			dependencies: ["auth-setup"],
		},
		{
			name: "mobile-small",
			testMatch: "tests/e2e/**/*.spec.ts",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 320, height: 568 },
				storageState: authState,
			},
			dependencies: ["auth-setup"],
		},
		{
			name: "a11y-chromium",
			testMatch: "tests/a11y/**/*.spec.ts",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
