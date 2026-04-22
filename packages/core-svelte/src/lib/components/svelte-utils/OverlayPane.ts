import { setContext, getContext } from 'svelte';
import type { Action } from 'svelte/action';
import { onDestroy } from 'svelte';

// The interface for FreonComponent, which enables us to determine whether a dropdown
// or context menu is in the visible part of the FreonComponent, and makes scrolling possible.

export type OverlayPane = {
    /** Visible (clipped) rect of `el` within this pane, or null if not measurable. */
    getVisibleRect(el: HTMLElement): Promise<DOMRectReadOnly | null>;
    /** The scrollable element for this pane (whose scrollTop changes). */
    getScrollContainer(): HTMLElement | null;
    /** The shared overlay root for portaled UI (dropdowns, context menus, etc.). */
    getOverlayRoot(): HTMLElement | null;
};

export type OverlayListenerOpts = {
    pane: OverlayPane | null;
    enabled: boolean;
    /** called on scroll/outside */
    closeFunc: () => void;
    /** elements that count as "inside" (clicks here won't close) */
    inside?: Array<HTMLElement | null | undefined>;
    /** also close on resize (default true) */
    closeOnResize?: boolean;
};

const PANE_CTX = Symbol('freon-overlay-root');

export function providePaneContext(api: OverlayPane) {
    setContext(PANE_CTX, api);
}

export function usePaneContext(): OverlayPane | null {
    // getContext returns undefined if not set
    return (getContext<OverlayPane | undefined>(PANE_CTX) as OverlayPane | undefined) ?? null;
}

export const portal: Action<HTMLElement, HTMLElement | null | undefined> = (node, target) => {
    let currentTarget: HTMLElement | null | undefined = target;

    function mount(t: HTMLElement | null | undefined) {
        if (!t) return;
        t.appendChild(node);
    }

    mount(currentTarget);

    return {
        update(newTarget) {
            if (newTarget === currentTarget) return;
            currentTarget = newTarget;
            mount(currentTarget);
        },
        destroy() {
            node.remove();
        }
    };
};

export function useOverlayListeners(opts: () => OverlayListenerOpts) {
    let cleanup: (() => void) | null = null;

    function isEventInside(e: Event, inside: (HTMLElement | null | undefined)[]) {
        const t = e.target as Node | null;
        const path =
            typeof (e as Event & { composedPath?: () => EventTarget[] }).composedPath === 'function'
                ? (e as Event & { composedPath: () => EventTarget[] }).composedPath()
                : [];

        return inside.some((el) => {
            if (!el) return false;
            if (t && el.contains(t)) return true;
            return path.includes(el);
        });
    }

    function detach() {
        cleanup?.();
        cleanup = null;
    }

    function attach() {
        detach();

        const { pane, enabled, closeFunc, inside = [], closeOnResize = true } = opts();
        if (!enabled) return;

        const scroller = pane?.getScrollContainer();

        const onScroll = (e?: Event) => {
            if (e && isEventInside(e, inside)) return;
            closeFunc();
        };

        const onResize = () => {
            if (closeOnResize) closeFunc();
        };

        const onPointerDown = (e: PointerEvent) => {
            if (!isEventInside(e, inside)) {
                closeFunc();
            }
        };

        if (scroller) scroller.addEventListener('scroll', onScroll, { capture: true });
        window.addEventListener('scroll', onScroll, true);
        if (closeOnResize) window.addEventListener('resize', onResize);
        document.addEventListener('pointerdown', onPointerDown, true);

        cleanup = () => {
            if (scroller)
                scroller.removeEventListener('scroll', onScroll, { capture: true } as any);
            window.removeEventListener('scroll', onScroll, true);
            if (closeOnResize) window.removeEventListener('resize', onResize);
            document.removeEventListener('pointerdown', onPointerDown, true);
        };
    }

    onDestroy(() => detach());

    return { attach, detach };
}
