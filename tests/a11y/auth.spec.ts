import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the rendered authentication route has no detectable axe violations", async ({
	page,
}) => {
	await page.goto("auth");
	await expect(page.getByRole("heading", { name: "Prossima" })).toBeVisible();

	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
});
