import { expect, test } from "./fixtures";

test("profile changes persist and appear on home", async ({ page, owner }) => {
	await page.goto("settings/profile");
	await expect(page.getByLabel("Nome visualizzato")).toHaveValue(owner.displayName);
	await page.getByLabel("Nome visualizzato").fill("Updated Athlete");
	await page.getByLabel("Nome completo", { exact: true }).fill("Test Athlete");
	await page.getByRole("button", { name: "Avatar 2", exact: true }).click();
	await page.getByRole("button", { name: "Salva modifiche" }).click();
	await expect(page.getByRole("alert")).toHaveText("Profilo aggiornato con successo!");
	await page.reload();
	await expect(page.getByLabel("Nome visualizzato")).toHaveValue("Updated Athlete");
	await expect(page.getByLabel("Nome completo", { exact: true })).toHaveValue("Test Athlete");
	await expect(page.getByRole("img", { name: "Avatar Preview" })).toHaveAttribute("src", "/prossima/avatars/avatar_2.png");
	await page.getByRole("navigation").getByRole("link", { name: "Home", exact: true }).click();
	await expect(page.getByRole("heading", { name: "Updated Athlete" })).toBeVisible();
});

test("theme selection survives reload and navigation", async ({ page }) => {
	await page.goto("settings");
	await page.getByRole("button", { name: "Tema Automatico" }).click();
	await expect(page.getByRole("button", { name: "Tema Chiaro" })).toBeVisible();
	await expect(page.locator("html")).not.toHaveClass(/dark/);
	await page.getByRole("button", { name: "Tema Chiaro" }).click();
	await expect(page.locator("html")).toHaveClass(/dark/);
	await page.reload();
	await expect(page.getByRole("button", { name: "Tema Scuro" })).toBeVisible();
	await expect(page.locator("html")).toHaveClass(/dark/);
	await page.getByRole("navigation").getByRole("link", { name: "Esercizi", exact: true }).click();
	await expect(page).toHaveURL(/\/prossima\/exercises\/?$/);
	await expect(page.locator("html")).toHaveClass(/dark/);
});
