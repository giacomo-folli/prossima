import { expect, test } from "./fixtures";

test.use({ authenticated: false });

test("protected routes redirect to login", async ({ page }) => {
	for (const route of ["home", "exercises", "training", "analytics", "settings/profile"]) {
		await page.goto(route);
		await expect(page).toHaveURL(/\/prossima\/auth\/?$/);
		await expect(page.getByRole("button", { name: "Accedi", exact: true })).toBeVisible();
	}
});

test("invalid credentials show an error; login and logout update access", async ({ page, owner }) => {
	await page.goto("auth");
	const login = page.getByRole("button", { name: "Accedi", exact: true });
	await expect(login).toBeDisabled();
	await page.getByLabel("Email").fill(owner.email);
	await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
	await login.click();
	await expect(page.getByText("Invalid login credentials", { exact: true })).toBeVisible();
	await expect(page).toHaveURL(/\/auth\/?$/);
	await page.getByLabel("Password", { exact: true }).fill(owner.password);
	await login.click();
	await expect(page).toHaveURL(/\/prossima\/home\/?$/);
	await expect(page.getByRole("heading", { name: owner.displayName })).toBeVisible();
	await page.goto("settings");
	await page.getByRole("button", { name: "Logout" }).click();
	await expect(page).toHaveURL(/\/prossima\/auth\/?$/);
	await page.goto("home");
	await expect(page).toHaveURL(/\/prossima\/auth\/?$/);
});
