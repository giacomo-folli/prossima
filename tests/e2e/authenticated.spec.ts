import { expect, test } from "./fixtures";

test("home shows the signed-in profile and keeps the session after reload", async ({ page, owner }) => {
	await page.goto("home");
	await expect(page.getByRole("heading", { name: owner.displayName })).toBeVisible();
	await page.reload();
	await expect(page).toHaveURL(/\/prossima\/home\/?$/);
	await expect(page.getByRole("heading", { name: owner.displayName })).toBeVisible();
});

test("another user's exercises and direct detail links stay private", async ({ page, program, otherExercise }) => {
	await page.goto("exercises");
	await expect(page.getByRole("link", { name: program.name })).toBeVisible();
	await expect(page.getByText(otherExercise.name)).toHaveCount(0);
	await page.goto(`exercises/${otherExercise.id}`);
	await expect(page.getByText("Exercise not found.")).toBeVisible();
	await expect(page.getByRole("heading", { name: otherExercise.name })).toHaveCount(0);
});
