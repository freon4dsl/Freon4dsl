export type PaneLike = {
	getVisibleRect(el: HTMLElement): Promise<DOMRectReadOnly | null>;
	getScrollContainer(): HTMLElement | null;
};

const EPS = 0.5; // deal with fractional pixels

export async function focusAndScrollIntoView(
	element: HTMLElement | null | undefined,
	pane: PaneLike | null | undefined
) {
	if (!element || !pane) return;

	// Focus without browser auto-scrolling
	element.focus({ preventScroll: true });

	// How much is visible *inside the pane’s scroll container*?
	const vis = await pane.getVisibleRect(element);
	const sc = pane.getScrollContainer();
	if (!vis || !sc) return;

	// If container can't scroll, bail early (no-op)
	const canScroll = sc.scrollHeight > sc.clientHeight || sc.scrollWidth > sc.clientWidth;
	if (!canScroll) return;

	const elRect = element.getBoundingClientRect();
	const scRect = sc.getBoundingClientRect();
	const paneHeight = sc.clientHeight;

	const fits = elRect.height <= paneHeight + EPS;
	const fullyVisible = vis.height >= Math.min(elRect.height, paneHeight) - EPS;

	if (fits && fullyVisible) return;

	// Compute minimal scroll in the container's coordinate system
	const offsetTop = elRect.top - scRect.top + sc.scrollTop;
	const offsetBottom = elRect.bottom - scRect.top + sc.scrollTop;

	if (fits) {
		// Bring entire element into view by aligning its bottom if needed
		sc.scrollTo({ top: Math.max(0, offsetBottom - paneHeight), behavior: "smooth" });
		return;
	}

	// Taller than visible area → align top if it’s outside the viewport of the pane
	const topInView = elRect.top >= scRect.top - EPS && elRect.top <= scRect.bottom + EPS;
	if (!topInView) {
		sc.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
	}
}
