// Utilities created by ChatGPT on August 28, 2025

import { FreLogger, notNullOrUndefined } from '@freon4dsl/core';

// Treat these as scrollable values (Safari still uses 'overlay' in places)
const SCROLLABLE_VALUES = new Set(["auto", "scroll", "overlay"]);
const LOGGER = new FreLogger('ScrollingUtils');

function isScrollable(el: HTMLElement): boolean {
	const cs: CSSStyleDeclaration = getComputedStyle(el);
	const canScrollY: boolean = SCROLLABLE_VALUES.has(cs.overflowY);
	const canScrollX: boolean = SCROLLABLE_VALUES.has(cs.overflowX);
	const hasY: boolean = el.scrollHeight > el.clientHeight;
	const hasX: boolean = el.scrollWidth > el.clientWidth;
	return (canScrollY && hasY) || (canScrollX && hasX);
}

/** Walk up from `start` to find the nearest scrollable ancestor. Handles Shadow DOM. */
export function getNearestScrollContainer(start: HTMLElement | undefined): HTMLElement | null {
	// LOGGER.log('getNearestScrollContainer', start?.id);
	let node: Node | undefined = start;
	while (notNullOrUndefined(node)) {
		if (node instanceof HTMLElement) {
			// LOGGER.log('getNearestScrollContainer', node? 'id:'+node.id : '<no-id>', 'testing scrollability', isScrollable(node));
			if (isScrollable(node)) return node;
			// Stop if we reach the viewport scroller
			if (node === document.body || node === document.documentElement) {
				return (document.scrollingElement as HTMLElement) ?? document.documentElement;
			}
		}
		// climb regular DOM
		const parentEl: HTMLElement | null = (node as HTMLElement).parentElement;
		if (parentEl) {
			node = parentEl;
			continue;
		}
		// climb out of Shadow DOM, if any
		const root: Node = (node as HTMLElement).getRootNode?.();
		if (root && (root as ShadowRoot).host) {
			node = (root as ShadowRoot).host;
			continue;
		}
		node = undefined;
	}
	// Fallback: viewport scroller
	return (document.scrollingElement as HTMLElement) ?? document.documentElement;
}
