import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ProgressBar from "$lib/components/ProgressBar.svelte";

describe("ProgressBar", () => {
	it("renders and reacts to a progress update", async () => {
		const view = render(ProgressBar, { pct: 25 });
		const fill = view.container.querySelector<HTMLElement>(".progress-fill");

		expect(fill).toHaveStyle({ width: "25%" });

		await view.rerender({ pct: 70 });
		expect(fill).toHaveStyle({ width: "70%" });
	});
});
