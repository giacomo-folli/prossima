import { writable } from "svelte/store";
import type { UserProfile } from "$lib/types";

export const user = writable<(UserProfile & { email?: string }) | null>(null);
