import { expect, test } from "./fixtures";

test("an authenticated owner can open the home route", async ({ page, owner }) => {
	await page.goto("/home");

	await expect(page).toHaveURL(/\/home$/);
	await expect(
		page.getByRole("heading", { name: owner.displayName }),
	).toBeVisible();
});
