import { expect, test } from "./fixtures";

test("log a workout, reload its history, edit it and delete it", async ({ page, program, owner }) => {
	await page.goto("home");
	const save = page.getByRole("button", { name: "Registra sessione" });
	await expect(save).toBeDisabled();
	await page.getByText(program.name, { exact: true }).click();
	await page.getByRole("button", { name: "Segna set 1 completato", exact: true }).click();
	await page.getByRole("button", { name: program.quickName }).click();
	await expect(page.getByRole("button", { name: program.quickName })).toHaveAttribute("aria-pressed", "true");
	await expect(save).toBeEnabled();
	await save.click();
	await expect(page).toHaveURL(/\/prossima\/home\/?$/);
	await page.reload();
	await expect(page.getByText("Esercizio di oggi completato. Adesso riposo!")).toBeVisible();

	// The home page has no session-detail link. Discover the ID through the
	// owner's real API and verify the saved set data, then review it in the UI.
	const { data, error } = await owner.db.from("training_sessions").select("*").single();
	expect(error).toBeNull();
	expect(data!.exercises).toEqual(expect.arrayContaining([
		expect.objectContaining({
			id: program.id,
			logged_sets: [
				{ set_index: 0, completed: true, reps: 5 },
				{ set_index: 1, completed: false, reps: 5 },
				{ set_index: 2, completed: false, reps: 5 },
			],
		}),
		expect.objectContaining({ name: program.quickName }),
	]));
	const detail = `training/${data!.id}`;
	await page.goto(detail);
	await expect(page.getByRole("heading", { name: "Sessione", exact: true })).toBeVisible();
	await expect(page.getByRole("link", { name: program.name })).toBeVisible();
	await expect(page.getByText(program.quickName, { exact: true })).toBeVisible();

	await page.getByRole("button", { name: "Modifica sessione" }).click();
	await page.getByPlaceholder("Come è andata? Aggiungi una nota…").fill("Good workout, increase reps next time.");
	await page.getByRole("button", { name: `Rimuovi ${program.quickName}` }).click();
	await page.getByRole("button", { name: "Salva modifiche" }).click();
	await expect(page.getByRole("button", { name: "Modifica sessione" })).toBeVisible();
	await page.reload();
	await expect(page.getByText("Good workout, increase reps next time.")).toBeVisible();
	await expect(page.getByText(program.quickName, { exact: true })).toHaveCount(0);
	await page.getByRole("button", { name: "Modifica sessione" }).click();
	await expect(page.getByPlaceholder("Come è andata? Aggiungi una nota…")).toHaveValue("Good workout, increase reps next time.");
	await page.getByRole("button", { name: "Annulla", exact: true }).first().click();

	page.once("dialog", (dialog) => dialog.dismiss());
	await page.getByRole("button", { name: "Elimina sessione" }).click();
	await expect(page.getByRole("heading", { name: "Sessione", exact: true })).toBeVisible();
	page.once("dialog", (dialog) => dialog.accept());
	await page.getByRole("button", { name: "Elimina sessione" }).click();
	await expect(page).toHaveURL(/\/prossima\/home\/?$/);
	await page.reload();
	await expect(page.getByRole("link", { name: "Vai agli esercizi" })).toBeVisible();
	await page.goto(detail);
	await expect(page.getByText("Sessione non trovata.")).toBeVisible();
	const { data: remaining, error: readError } = await owner.db.from("training_sessions").select("id");
	expect(readError).toBeNull();
	expect(remaining).toEqual([]);
});
