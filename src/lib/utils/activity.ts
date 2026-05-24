import type { Exercise, TrainingSession } from "../types";

const IT_WEEKDAY_LABELS = ["D", "L", "M", "M", "G", "V", "S"];

export function toDateKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function getLast7Days(): { date: string; label: string }[] {
	const days: { date: string; label: string }[] = [];
	for (let i = 6; i >= 0; i--) {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() - i);
		days.push({
			date: toDateKey(d),
			label: IT_WEEKDAY_LABELS[d.getDay()],
		});
	}
	return days;
}

export function daysWithActivity(
	sessions: TrainingSession[],
	exercises: Exercise[],
): Set<string> {
	const active = new Set<string>();

	for (const session of sessions) {
		const d = new Date(session.completed_at);
		active.add(toDateKey(d));
	}

	// TODO: check if can remove or is needed elsewhere
	// for (const ex of exercises) {
	// 	for (const step of ex.steps ?? []) {
	// 		if (!step.completed_at) continue;
	// 		active.add(toDateKey(new Date(step.completed_at)));
	// 	}
	// }

	return active;
}
