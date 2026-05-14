import { browser } from "$app/environment";
import { resolve } from "$app/paths";
import { StorageKeys } from "$lib/utils/enums";
import { defaultExercises } from "$lib/utils/parsing";
import { redirect } from "@sveltejs/kit";

export const load = () => {
	if (browser) {
		if (!localStorage?.getItem(StorageKeys.CONFIG_FILE)) {
			localStorage?.setItem(StorageKeys.CONFIG_FILE, defaultExercises);
		}
	}

	throw redirect(307, resolve("/training"));
};
