// Utilities created by ChatGPT on August 28, 2025

// paneContext.ts
import { setContext, getContext } from "svelte";

// The interface for FreonComponent, which enables us to determine whether a new element is in
// the visible part of the FreonComponent, and makes scrolling possible
export type PaneLike = {
	/** Return the visible (clipped) rect of `el` within this pane, or null if not measurable. */
	getVisibleRect(el: HTMLElement): Promise<DOMRectReadOnly | null>;
	/** Return the actual scrollable element for this pane (whose scrollTop changes). */
	getScrollContainer(): HTMLElement | null;
};

const PANE_CTX = Symbol("pane-ctx");

export function providePaneContext(api: PaneLike) {
	setContext(PANE_CTX, api);
}

export function usePaneContext(): PaneLike | null {
	// getContext returns undefined if not set
	return (getContext<PaneLike | undefined>(PANE_CTX) as PaneLike | undefined) ?? null;
}
