import { H as escape_html, V as attr, a as ensure_array_like, c as store_get, l as stringify, n as attr_class, o as head, u as unsubscribe_stores } from "../../chunks/dev.js";
import { r as ProgressBar, t as exerciseProgress } from "../../chunks/exercises.js";
//#region src/lib/components/ExerciseCard.svelte
function ExerciseCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { id, name, pct, completedCount, total, current, next, isComplete } = $$props;
		$$renderer.push(`<a${attr("href", `/exercise/${stringify(id)}`)}${attr_class("card svelte-mhyln8", void 0, { "done": isComplete })}><div class="card-header svelte-mhyln8"><span class="name svelte-mhyln8">${escape_html(name)}</span> <span class="pct svelte-mhyln8">${escape_html(pct)}%</span></div> `);
		ProgressBar($$renderer, { pct });
		$$renderer.push(`<!----> <div class="card-body svelte-mhyln8">`);
		if (isComplete) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="step-label complete-label svelte-mhyln8">✓ Completed</p>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<p class="step-label svelte-mhyln8"><span class="step-meta svelte-mhyln8">Now</span> ${escape_html(current?.label ?? "—")}</p> `);
			if (next) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<p class="step-label next svelte-mhyln8"><span class="step-meta svelte-mhyln8">Next</span> ${escape_html(next.label)}</p>`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></div> <div class="card-footer svelte-mhyln8"><span class="count svelte-mhyln8">${escape_html(completedCount)}/${escape_html(total)} steps</span></div></a>`);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const progress = exerciseProgress;
		function overallPct(p) {
			return p.length ? Math.round(p.reduce((sum, e) => sum + e.pct, 0) / p.length) : 0;
		}
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Progressioni</title>`);
			});
		});
		$$renderer.push(`<div class="page svelte-1uha8ag"><header class="site-header svelte-1uha8ag"><div class="header-inner svelte-1uha8ag"><h1 class="svelte-1uha8ag">Progressioni</h1> <span class="overall-pct svelte-1uha8ag">${escape_html(overallPct(store_get($$store_subs ??= {}, "$progress", progress)))}% overall</span></div> <p class="subtitle svelte-1uha8ag">${escape_html(store_get($$store_subs ??= {}, "$progress", progress).filter((e) => !e.isComplete).length)} exercise${escape_html(store_get($$store_subs ??= {}, "$progress", progress).filter((e) => !e.isComplete).length !== 1 ? "s" : "")} in progress</p></header> <main><div class="grid svelte-1uha8ag"><!--[-->`);
		const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$progress", progress));
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let ex = each_array[$$index];
			ExerciseCard($$renderer, {
				id: ex.id,
				name: ex.name,
				pct: ex.pct,
				completedCount: ex.completedCount,
				total: ex.total,
				current: ex.current,
				next: ex.next,
				isComplete: ex.isComplete
			});
		}
		$$renderer.push(`<!--]--></div></main></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
