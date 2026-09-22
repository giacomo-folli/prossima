import { randomUUID } from "node:crypto";
import { expect, test as base } from "@playwright/test";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../src/lib/database.types";

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };

type Owner = {
	id: string;
	email: string;
	password: string;
	displayName: string;
	session: Session;
	db: SupabaseClient<Database>;
};

type Program = { id: string; name: string; quickName: string };

export const test = base.extend<{
	owner: Owner;
	program: Program;
	otherExercise: { id: string; name: string };
	authenticated: boolean;
}>({
	authenticated: [true, { option: true }],
	owner: async ({}, use) => {
		const url = process.env.PUBLIC_SUPABASE_URL;
		const adminKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
		const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;
		if (url !== "http://127.0.0.1:54321" || !adminKey || !anonKey) {
			throw new Error("Use pnpm test:e2e with the local Supabase stack running.");
		}
		const admin = createClient<Database>(url, adminKey, clientOptions);
		const db = createClient<Database>(url, anonKey, clientOptions);
		const email = `e2e-${randomUUID()}@prossima.test`;
		const password = "Prossima-e2e-123!";
		const displayName = "E2E Athlete";
		const { data, error } = await admin.auth.admin.createUser({
			email, password, email_confirm: true,
			user_metadata: { display_name: displayName },
		});
		if (error) throw error;
		const id = data.user.id;
		try {
			const { data: auth, error: authError } = await db.auth.signInWithPassword({ email, password });
			if (authError) throw authError;
			await use({ id, email, password, displayName, session: auth.session!, db });
		} finally {
			// These foreign keys do not cascade from auth.users. Clean up even when
			// an assertion fails, without touching the seeded users or other tests.
			const sessions = await admin.from("training_sessions").delete().eq("user_id", id);
			const exercises = await admin.from("exercises").delete().eq("user_id", id);
			const user = await admin.auth.admin.deleteUser(id);
			for (const result of [sessions, exercises, user]) {
				if (result.error) throw result.error;
			}
		}
	},
	storageState: async ({ owner, baseURL, authenticated }, use) => {
		await use({
			cookies: [],
			origins: authenticated ? [{
				origin: new URL(baseURL!).origin,
				localStorage: [{ name: "sb-127-auth-token", value: JSON.stringify(owner.session) }],
			}] : [],
		});
	},
	otherExercise: async ({ owner }, use) => {
		// Depend on owner so its local-only environment guard runs first.
		const admin = createClient<Database>(process.env.PUBLIC_SUPABASE_URL!, process.env.SUPABASE_TEST_SERVICE_ROLE_KEY!, clientOptions);
		const { data, error } = await admin.auth.admin.createUser({ email: `e2e-other-${randomUUID()}@prossima.test`, email_confirm: true });
		if (error) throw error;
		const id = randomUUID();
		const name = `Private exercise for ${owner.id}`;
		try {
			const { error: insertError } = await admin.from("exercises").insert({ id, user_id: data.user.id, name, type: "exercise" });
			if (insertError) throw insertError;
			await use({ id, name });
		} finally {
			const exercise = await admin.from("exercises").delete().eq("user_id", data.user.id);
			const user = await admin.auth.admin.deleteUser(data.user.id);
			if (exercise.error) throw exercise.error;
			if (user.error) throw user.error;
		}
	},
	program: async ({ owner }, use) => {
		const id = randomUUID();
		const name = "E2E Squat";
		const quickName = "E2E Stretch";
		const { error } = await owner.db.from("exercises").insert([
			{ id, user_id: owner.id, name, type: "exercise", current_step_index: 0 },
			{ id: randomUUID(), user_id: owner.id, name: quickName, type: "quick-exercise", icon: "⚡", current_step_index: 0 },
		]);
		if (error) throw error;
		const { error: stepsError } = await owner.db.from("steps").insert(
			["3 serie da 5 ripetizioni", "3 serie da 8 ripetizioni", "3 serie da 10 ripetizioni"]
				.map((description, step_index) => ({ exercise_id: id, description, step_index, completed: false })),
		);
		if (stepsError) throw stepsError;
		await use({ id, name, quickName });
	},
});

export { expect };
