import { expect, test, testOwner } from "./fixtures";

const authState = "playwright/.auth/owner.json";

test("authenticate the seeded owner", async ({ page }) => {
	await page.goto("/auth");
	await page.getByLabel("Email").fill(testOwner.email);
	await page.getByLabel("Password", { exact: true }).fill(testOwner.password);
	await page.getByRole("button", { name: "Accedi" }).click();

	await expect(page).toHaveURL(/\/home$/);
	await expect(page.getByText("Bentornato/a")).toBeVisible();
	await page.context().storageState({ path: authState });
});
