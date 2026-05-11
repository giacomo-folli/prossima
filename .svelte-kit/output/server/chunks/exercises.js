import { D as derived, k as writable, l as stringify, n as attr_class, r as attr_style } from "./dev.js";
import "./index-server.js";
//#region src/lib/components/ProgressBar.svelte
function ProgressBar($$renderer, $$props) {
	let { pct = 0, compact = false } = $$props;
	$$renderer.push(`<div${attr_class("progress-track svelte-1qjgclg", void 0, { "compact": compact })}><div class="progress-fill svelte-1qjgclg"${attr_style(`width: ${stringify(pct)}%`)}></div></div>`);
}
//#endregion
//#region src/lib/data/defaultExercises.ts
function makeSteps(labels) {
	return labels.map((label, i) => ({
		id: `step-${i}`,
		label,
		completed: false,
		completedAt: void 0
	}));
}
var defaultExercises = [
	{
		id: "push-ups",
		name: "Push Ups",
		currentStepIndex: 0,
		steps: makeSteps([
			"10 rip x3",
			"6 rip x3",
			"8 rip x3",
			"10 rip x3",
			"12 rip x3",
			"14 + 12 + 10",
			"16 + 14 + 12",
			"16 rip x3",
			"20 rip x3 con pausa lunga"
		])
	},
	{
		id: "pull-up",
		name: "Pull Up",
		currentStepIndex: 0,
		steps: makeSteps([
			"1 rip negative x5",
			"2 rip negative x3",
			"2 rip negative guidate x3",
			"4 rip negative x4",
			"2 rip x3",
			"3 + 2 + 2 con elastici",
			"3 + 2 + 2 + failure",
			"4 + 3 + 2 + failure",
			"6 + 6 + 6 con elastici"
		])
	},
	{
		id: "hollow-body",
		name: "Hollow Body",
		currentStepIndex: 0,
		steps: makeSteps([
			"30s tuck hollow x3",
			"40s tuck hollow x3",
			"30s tuck hollow advanced x3",
			"50s tuck hollow x3",
			"30s single leg hollow x3 (per lato)",
			"40s single leg hollow x3 (per lato)",
			"30s full senza braccia x3",
			"40s full senza braccia x3",
			"50s full senza braccia x3",
			"1min full senza braccia x3",
			"30s full x3",
			"2min"
		])
	},
	{
		id: "leg-raises",
		name: "Leg Raises",
		currentStepIndex: 0,
		steps: makeSteps([
			"30 x2 al pavimento (gambe piegate)",
			"30 x2 al pavimento (gambe piegate 45°)",
			"25 x2 al pavimento (piegando solo in salita)",
			"25 x2 al pavimento",
			"20 x2 al pavimento completi con chiusura",
			"20 x2 al pavimento toccando il pavimento",
			"15 x2 (piegate) + 2 set di plow raises",
			"15 x2 (piegate 45°) + 2 set di plow raises",
			"15 x2 + 2 set di plow raises",
			"20 x2 + 2 set di plow raises",
			"15 x2 toccando le mani"
		])
	},
	{
		id: "burpees",
		name: "Burpees",
		currentStepIndex: 0,
		steps: makeSteps([
			"1min x3",
			"1.5min x3",
			"2min x3",
			"1min x3 + 6 rip in 30s x2",
			"1min x3 + 8 rip in 40s x2",
			"1min x3 + 10 rip in 50s x2",
			"12 rip in 1min x3",
			"15 rip in 1min x3"
		])
	},
	{
		id: "squat",
		name: "Squat",
		currentStepIndex: 0,
		steps: makeSteps([
			"8 x6 con 40kg",
			"10 x5 con 40kg",
			"10 x5 con 44kg",
			"10 x5 con 48kg",
			"10 x3 con 50kg"
		])
	},
	{
		id: "calf-raises",
		name: "Calf Raises",
		currentStepIndex: 0,
		steps: makeSteps(["6 x3 con 40kg", "8 x3 con 40kg"])
	}
];
//#endregion
//#region src/lib/utils/storage.ts
var STORAGE_KEY = "progression-tracker-v1";
function loadFromStorage() {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function saveToStorage(exercises) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
	} catch {}
}
//#endregion
//#region src/lib/stores/exercises.ts
function createExercisesStore() {
	const { subscribe, set, update } = writable(loadFromStorage() ?? defaultExercises);
	function persist(exercises) {
		saveToStorage(exercises);
	}
	return {
		subscribe,
		completeCurrentStep(exerciseId) {
			update((exercises) => {
				const ex = exercises.find((e) => e.id === exerciseId);
				if (!ex) return exercises;
				const step = ex.steps[ex.currentStepIndex];
				if (!step || step.completed) return exercises;
				step.completed = true;
				step.completedAt = (/* @__PURE__ */ new Date()).toISOString();
				const nextIndex = ex.currentStepIndex + 1;
				if (nextIndex < ex.steps.length) ex.currentStepIndex = nextIndex;
				persist(exercises);
				return exercises;
			});
		},
		undoLastCompletion(exerciseId) {
			update((exercises) => {
				const ex = exercises.find((e) => e.id === exerciseId);
				if (!ex) return exercises;
				let lastCompletedIndex = -1;
				for (let i = ex.steps.length - 1; i >= 0; i--) if (ex.steps[i].completed) {
					lastCompletedIndex = i;
					break;
				}
				if (lastCompletedIndex === -1) return exercises;
				ex.steps[lastCompletedIndex].completed = false;
				ex.steps[lastCompletedIndex].completedAt = void 0;
				ex.currentStepIndex = lastCompletedIndex;
				persist(exercises);
				return exercises;
			});
		},
		reset() {
			set(defaultExercises.map((ex) => ({
				...ex,
				steps: ex.steps.map((s) => ({
					...s,
					completed: false,
					completedAt: void 0
				})),
				currentStepIndex: 0
			})));
			persist(defaultExercises);
		}
	};
}
var exercises = createExercisesStore();
var exerciseProgress = derived(exercises, ($exercises) => $exercises.map((ex) => {
	const completedCount = ex.steps.filter((s) => s.completed).length;
	const total = ex.steps.length;
	const pct = total === 0 ? 0 : Math.round(completedCount / total * 100);
	const current = ex.steps[ex.currentStepIndex] ?? null;
	const next = ex.steps[ex.currentStepIndex + 1] ?? null;
	const isComplete = completedCount === total;
	return {
		id: ex.id,
		name: ex.name,
		completedCount,
		total,
		pct,
		current,
		next,
		isComplete
	};
}));
//#endregion
export { exercises as n, ProgressBar as r, exerciseProgress as t };
