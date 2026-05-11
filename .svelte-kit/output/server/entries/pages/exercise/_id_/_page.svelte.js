import "../../../../chunks/environment.js";
import { H as escape_html, a as ensure_array_like, c as store_get, i as derived, l as stringify, n as attr_class, o as head, tt as getContext, u as unsubscribe_stores } from "../../../../chunks/dev.js";
import "../../../../chunks/client.js";
import { n as exercises, r as ProgressBar } from "../../../../chunks/exercises.js";
//#region node_modules/@sveltejs/kit/src/runtime/app/stores.js
/**
* A function that returns all of the contextual stores. On the server, this must be called during component initialization.
* Only use this if you need to defer store subscription until after the component has mounted, for some reason.
*
* @deprecated Use `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
*/
var getStores = () => {
	const stores$1 = getContext("__svelte__");
	return {
		/** @type {typeof page} */
		page: { subscribe: stores$1.page.subscribe },
		/** @type {typeof navigating} */
		navigating: { subscribe: stores$1.navigating.subscribe },
		/** @type {typeof updated} */
		updated: stores$1.updated
	};
};
/**
* A readable store whose value contains page data.
*
* On the server, this store can only be subscribed to during component initialization. In the browser, it can be subscribed to at any time.
*
* @deprecated Use `page` from `$app/state` instead (requires Svelte 5, [see docs for more info](https://svelte.dev/docs/kit/migrating-to-sveltekit-2#SvelteKit-2.12:-$app-stores-deprecated))
* @type {import('svelte/store').Readable<import('@sveltejs/kit').Page>}
*/
var page = { subscribe(fn) {
	return getStores().page.subscribe(fn);
} };
//#endregion
//#region src/lib/components/StepList.svelte
function StepList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { steps, currentStepIndex } = $$props;
		$$renderer.push(`<ol class="step-list svelte-vz383a"><!--[-->`);
		const each_array = ensure_array_like(steps);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let step = each_array[i];
			const state = step.completed ? "completed" : i === currentStepIndex ? "current" : "future";
			$$renderer.push(`<li${attr_class(`step ${stringify(state)}`, "svelte-vz383a")}><span class="step-icon svelte-vz383a">`);
			if (state === "completed") {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
			} else if (state === "current") {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<span class="dot-current svelte-vz383a"></span>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<span class="dot-future svelte-vz383a"></span>`);
			}
			$$renderer.push(`<!--]--></span> <span class="step-text svelte-vz383a">${escape_html(step.label)}</span> `);
			if (step.completedAt) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="step-date svelte-vz383a">${escape_html(new Date(step.completedAt).toLocaleDateString("it-IT", {
					day: "2-digit",
					month: "short"
				}))}</span>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></li>`);
		}
		$$renderer.push(`<!--]--></ol>`);
	});
}
//#endregion
//#region src/routes/exercise/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const id = derived(() => store_get($$store_subs ??= {}, "$page", page).params.id);
		const ex = derived(() => store_get($$store_subs ??= {}, "$exercises", exercises).find((e) => e.id === id()));
		const completedCount = derived(() => ex()?.steps.filter((s) => s.completed).length ?? 0);
		const total = derived(() => ex()?.steps.length ?? 0);
		const pct = derived(() => total() === 0 ? 0 : Math.round(completedCount() / total() * 100));
		const isComplete = derived(() => completedCount() === total());
		const currentStep = derived(() => ex()?.steps[ex().currentStepIndex] ?? null);
		const hasCompleted = derived(() => (ex()?.steps ?? []).some((s) => s.completed));
		head("1ofnayf", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(ex()?.name ?? "Exercise")} — Progressioni</title>`);
			});
		});
		if (ex()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="page svelte-1ofnayf"><nav class="breadcrumb svelte-1ofnayf"><a href="/" class="svelte-1ofnayf">← Back</a></nav> <header class="ex-header svelte-1ofnayf"><h1 class="svelte-1ofnayf">${escape_html(ex().name)}</h1> <div class="progress-row svelte-1ofnayf">`);
			ProgressBar($$renderer, { pct: pct() });
			$$renderer.push(`<!----> <span class="pct-label svelte-1ofnayf">${escape_html(pct())}%</span></div> <p class="step-count svelte-1ofnayf">${escape_html(completedCount())} of ${escape_html(total())} steps completed</p></header> `);
			if (!isComplete()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<section class="current-section svelte-1ofnayf"><p class="section-label svelte-1ofnayf">Current step</p> <div class="current-step-box svelte-1ofnayf"><p class="current-step-label svelte-1ofnayf">${escape_html(currentStep()?.label ?? "—")}</p> <button class="btn-complete svelte-1ofnayf">Mark complete</button></div></section>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<section class="current-section svelte-1ofnayf"><div class="complete-banner svelte-1ofnayf">All steps completed ✓</div></section>`);
			}
			$$renderer.push(`<!--]--> <section class="steps-section svelte-1ofnayf"><div class="steps-header svelte-1ofnayf"><p class="section-label svelte-1ofnayf">All steps</p> `);
			if (hasCompleted()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<button class="btn-undo svelte-1ofnayf">Undo last</button>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--></div> `);
			StepList($$renderer, {
				steps: ex().steps,
				currentStepIndex: ex().currentStepIndex
			});
			$$renderer.push(`<!----></section></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="page svelte-1ofnayf"><nav class="breadcrumb svelte-1ofnayf"><a href="/" class="svelte-1ofnayf">← Back</a></nav> <p>Exercise not found.</p></div>`);
		}
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
