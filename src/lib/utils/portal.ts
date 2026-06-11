/**
 * Svelte action to teleport/portal an element to a target selector.
 */
export function portal(node: HTMLElement, target: string = "#modal-portal-target") {
	const targetEl = document.querySelector(target);
	if (targetEl) {
		targetEl.appendChild(node);
	} else {
		console.warn(`Portal target "${target}" not found in the DOM.`);
	}

	return {
		destroy() {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}
	};
}
