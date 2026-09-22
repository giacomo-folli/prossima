import { expect, test } from "./fixtures";

test("create, validate, edit and delete an exercise, persisting each change", async ({ page }) => {
	await page.goto("exercises");
	await expect(page.getByRole("heading", { name: "Nessun esercizio" })).toBeVisible();
	await page.getByRole("button", { name: "Aggiungi esercizio" }).first().click();
	const dialog = page.getByRole("dialog");
	await dialog.getByRole("button", { name: "Aggiungi", exact: true }).click();
	await expect(dialog.getByText("Il nome è obbligatorio.")).toBeVisible();
	await expect(dialog.getByText("Aggiungi almeno uno step.")).toBeVisible();
	await dialog.getByPlaceholder("es. Squat, Plank…").fill("E2E Custom exercise");
	await dialog.getByRole("textbox").fill("3 serie da 5 ripetizioni\n3 serie da 8 ripetizioni");
	await dialog.getByRole("button", { name: "Aggiungi", exact: true }).click();
	await page.getByRole("link", { name: /E2E Custom exercise/ }).click();
	await expect(page.getByText("0 di 2 step completati")).toBeVisible();
	await page.reload();
	await expect(page.getByRole("heading", { name: "E2E Custom exercise" })).toBeVisible();

	await page.getByRole("link", { name: "Modifica esercizio" }).click();
	await page.getByPlaceholder("es. Squat, Plank…").fill("E2E Updated exercise");
	await page.getByRole("button", { name: "Aggiungi step" }).click();
	await page.getByPlaceholder("es. 3 serie da 10 ripetizioni").last().fill("3 serie da 12 ripetizioni");
	await page.getByRole("button", { name: "Salva esercizio" }).click();
	await expect(page.getByRole("heading", { name: "E2E Updated exercise" })).toBeVisible();
	await page.reload();
	await expect(page.getByText("0 di 3 step completati")).toBeVisible();
	await expect(page.getByText("3 serie da 12 ripetizioni", { exact: true })).toBeVisible();

	await page.getByRole("button", { name: "Elimina esercizio" }).click();
	await dialog.getByRole("button", { name: "Annulla" }).click();
	await expect(page.getByRole("heading", { name: "E2E Updated exercise" })).toBeVisible();
	await page.getByRole("button", { name: "Elimina esercizio" }).click();
	await dialog.getByRole("button", { name: "Elimina", exact: true }).click();
	await expect(page.getByRole("heading", { name: "Nessun esercizio" })).toBeVisible();
	await page.reload();
	await expect(page.getByRole("heading", { name: "Nessun esercizio" })).toBeVisible();
});

test("completing and undoing a step updates persisted progress and analytics", async ({ page, program }) => {
	await page.goto(`exercises/${program.id}`);
	await expect(page.getByText("0 di 3 step completati")).toBeVisible();
	await page.getByRole("button", { name: "Segna completato" }).click();
	await expect(page.getByText("1 di 3 step completati")).toBeVisible();
	await page.reload();
	await expect(page.getByText("1 di 3 step completati")).toBeVisible();
	await page.goto("analytics");
	await expect(page.getByText("1 di 3 step", { exact: true })).toBeVisible();
	await page.getByRole("link", { name: program.name, exact: true }).click();
	await page.getByRole("button", { name: "Annulla ultimo" }).click();
	await expect(page.getByText("0 di 3 step completati")).toBeVisible();
	await page.reload();
	await expect(page.getByText("0 di 3 step completati")).toBeVisible();
	await expect(page.getByRole("button", { name: "Annulla ultimo" })).toHaveCount(0);
	await page.goto("analytics");
	await expect(page.getByText("0 di 3 step", { exact: true })).toBeVisible();
});
