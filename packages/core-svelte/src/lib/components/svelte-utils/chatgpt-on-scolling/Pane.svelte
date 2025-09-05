<script lang="ts">
	import { getNearestScrollContainer } from "./Utilities.js"; // import from above

	let rootEl: HTMLDivElement | null = null;

	/** Nearest scrollable ancestor for this pane's root */
	export function getScrollContainer(): HTMLElement | null {
		return getNearestScrollContainer(rootEl);
	}

	/** One-shot: visible rect of `el` within this pane's scroll container (IO-powered) */
	export function getVisibleRect(el: HTMLElement): Promise<DOMRectReadOnly | null> {
		const sc = getScrollContainer();
		if (!el || !sc) return Promise.resolve(null);

		return new Promise((resolve) => {
			const io = new IntersectionObserver(
				(entries) => {
					resolve(entries[0]?.intersectionRect ?? null);
					io.disconnect();
				},
				{ root: sc, threshold: [0] }
			);
			io.observe(el);
		});
	}
</script>

<!-- Your pane root -->
<div class="pane" bind:this={rootEl}>
	<slot />
</div>
