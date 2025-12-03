// Treat these as scrollable values (Safari still uses 'overlay' in places)
const SCROLLABLE_VALUES = new Set(["auto", "scroll", "overlay"]);

function isScrollable(el: HTMLElement): boolean {
	const cs = getComputedStyle(el);
	const canScrollY = SCROLLABLE_VALUES.has(cs.overflowY);
	const canScrollX = SCROLLABLE_VALUES.has(cs.overflowX);
	const hasY = el.scrollHeight > el.clientHeight;
	const hasX = el.scrollWidth > el.clientWidth;
	return (canScrollY && hasY) || (canScrollX && hasX);
}

/** Walk up from `start` to find the nearest scrollable ancestor. Handles Shadow DOM. */
export function getNearestScrollContainer(start: HTMLElement | null): HTMLElement | null {
	let node: Node | null = start;
	while (node) {
		if (node instanceof HTMLElement) {
			if (isScrollable(node)) return node;
			// Stop if we reach the viewport scroller
			if (node === document.body || node === document.documentElement) {
				return (document.scrollingElement as HTMLElement) ?? document.documentElement;
			}
		}
		// climb regular DOM
		const parentEl = (node as HTMLElement).parentElement;
		if (parentEl) {
			node = parentEl;
			continue;
		}
		// climb out of Shadow DOM, if any
		const root = (node as HTMLElement).getRootNode?.();
		if (root && (root as ShadowRoot).host) {
			node = (root as ShadowRoot).host;
			continue;
		}
		node = null;
	}
	// Fallback: viewport scroller
	return (document.scrollingElement as HTMLElement) ?? document.documentElement;
}
