<script lang="ts">
    import { CONTEXTMENU_LOGGER } from './ComponentLoggers.js';

    /**
     *  This component combines a menu with a submenu. The positions of both the menu and the submenu are determined
     *  such that the complete menu stays within the boundaries of the editor viewport.
     *  Note that the component is rendered as part of an overlay that is provided by the FreonComponent.
     */
    import { type MainComponentProps } from './svelte-utils/FreComponentProps.js';
    import { tick } from 'svelte';
    import { MenuItem } from '@freon4dsl/core';
    import { contextMenuVisible } from './stores/AllStores.svelte.js';
    import { usePaneContext, portal, useOverlayListeners } from "./svelte-utils/OverlayPane.js"

    // props
    let { editor }: MainComponentProps = $props();

    // elements for the use of the overlay
    const pane = usePaneContext();
    let overlayRoot = $derived(pane?.getOverlayRoot() ?? null)
    const listeners = useOverlayListeners(() => ({
        pane,
        enabled: contextMenuVisible.value,
        closeFunc: hide,
        inside: [panelEl],
        closeOnResize: true,
    }));

    // local variables
    const LOGGER = CONTEXTMENU_LOGGER;
    let _items: MenuItem[] = $state([]);
    let submenuItems: MenuItem[] = $state([]);
    let elementIndex: number; // the index of the element in a list to which this menu is coupled

    // dimension (height and width) of context menu
    let menuHeight = $state(0);
    let menuWidth = $state(0);
    // position of context menu
    let top = $state(0);
    let left = $state(0);
    // dimension (height and width) of sub menu
    let submenuHeight = $state(0);
    let submenuWidth = $state(0);
    // position of sub menu
    let topSub = $state(0);
    let leftSub = $state(0);
    // height of items in menu and sub menu
    let itemHeight = $state(40);
    let submenuOpen = $state(false);
    let panelEl: HTMLElement | null = $state(null);

    /**
     * This function shows the context menu. Note that the items to be shown should
     * already be set (based on the box to which the menu is coupled)
     * @param event
     * @param index
     * @param items
     */
    export async function show(event: MouseEvent, index: number, items: MenuItem[]) {
        LOGGER.log('CONTEXTMENU show for index ' + index);
        _items = items;
        elementIndex = index;
        contextMenuVisible.value = true;
        submenuOpen = false;

        // wait for the menu to be rendered, because we need its sizes for the positioning
        await tick();
        // let any selection-triggered scrolling settle
        await new Promise<void>((resolve) =>
            requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve())
            )
        );
        // get the position of the mouse relative to the editor view
        getContextMenuPosition(event);
        // attach listeners for scrolling, (!) after waiting for all elements to be
        // rendered, because only then 'panelEl' has a value.
        listeners.attach();
    }

    /** This function is used to get the position of the context menu. */
    function getContextMenuPosition(event: MouseEvent) {
        // overlay coordinates
        const overlay = pane?.getOverlayRoot();
        const r = overlay?.getBoundingClientRect();

        // fallback (shouldn't happen once overlay exists)
        const ox = r?.left ?? 0;
        const oy = r?.top ?? 0;
        const ow = r?.width ?? window.innerWidth;
        const oh = r?.height ?? window.innerHeight;

        // mouse position relative to overlay
        const clickX = event.clientX - ox;
        const clickY = event.clientY - oy;

        // prefer below/right of pointer - with a little gap
        const GAP = 2;
        let x = clickX + GAP;
        let y = clickY + GAP;

        // flip horizontally if needed
        if (x + menuWidth > ow) {
            x = clickX - menuWidth;
        }

        // flip vertically if needed
        if (y + menuHeight > oh) {
            y = clickY - menuHeight;
        }

        // final clamp
        left = Math.max(0, Math.min(x, ow - menuWidth));
        top = Math.max(0, Math.min(y, oh - menuHeight));

        LOGGER.log(
            `ContextMenu left:${left}, top:${top}, clientX:${event.clientX}, clientY:${event.clientY}, ox: ${ox},  menuW:${menuWidth}, menuH:${menuHeight}`,
        );
    }

    /**
     * This function hides the context menu
     */
    export function hide() {
        LOGGER.log('CONTEXTMENU hide');
        contextMenuVisible.value = false;
        submenuOpen = false;

        listeners.detach();
    }

    /**
     * This function shows the sub menu
     */
    async function openSub(itemIndex: number) {
        submenuOpen = true;
        await tick(); // submenuWidth/submenuHeight must be known

        const overlay = pane?.getOverlayRoot();
        const r = overlay?.getBoundingClientRect();
        const ow = r?.width ?? window.innerWidth;
        const oh = r?.height ?? window.innerHeight;

        // align submenu with the clicked item
        const itemTop = top + itemIndex * itemHeight;

        // prefer opening to the right
        let x = left + menuWidth - 10;
        if (x + submenuWidth > ow) {
            x = left - submenuWidth + 10;
        }
        // prefer aligning submenu top with parent item
        let y = itemTop;
        // if submenu would run below viewport, move it up
        if (y + submenuHeight > oh) {
            y = oh - submenuHeight;
        }
        // if still above top, clamp
        if (y < 0) {
            y = 0;
        }

        leftSub = Math.max(0, Math.min(x, ow - submenuWidth));
        topSub = Math.max(0, Math.min(y, oh - submenuHeight));
    }

    /**
     * This function finds the context menu dimensions the moment that
     * 'contextMenuVisible.value' becomes true and the menu is shown.
     */
    function getContextMenuDimension(htmlElement: HTMLElement) {
        menuHeight = htmlElement.offsetHeight;
        menuWidth = htmlElement.offsetWidth;
    }

    /**
     * This function finds the sub menu dimensions the moment that
     * submenuOpen becomes true and the menu is shown.
     */
    function getSubMenuDimension(node: HTMLElement) {
        submenuHeight = node.offsetHeight;
        submenuWidth = node.offsetWidth;
    }

    function onClick(event: MouseEvent, item: MenuItem, itemIndex: number): boolean {
        LOGGER.log('CONTEXTMENU onClick');
        submenuOpen = false;
        if (item.hasSubItems()) {
            submenuItems = item.subItems;
            openSub(itemIndex);
        } else {
            item.handler(editor.selectedBox.node, elementIndex, editor);
            hide();
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
</script>

{#if contextMenuVisible.value}
    <!-- IMPORTANT: clickOutside must be on the *portaled* panel, not on a wrapper outside the portal -->
    <div
        class="context-menu-panel"
        use:portal={overlayRoot}
        bind:this={panelEl}
    >
        <nav use:getContextMenuDimension class="contextmenu" style="top: {top}px; left: {left}px">
            {#each _items as item, index}
                {#if item.label === '---'}
                    <hr class="contextmenu-hr" />
                {:else}
                    <button
                        class="contextmenu-button"
                        onclick={(event) => onClick(event, item, index)}
                        bind:clientHeight={itemHeight}
                    >
                        {item.label}
                        {#if item.shortcut}
                            <span class="contextmenu-shortcut">{item.shortcut}</span>
                        {/if}
                    </button>
                {/if}
            {/each}
        </nav>
        {#if submenuOpen}
            <nav
                use:getSubMenuDimension
                class="contextmenu"
                style="top: {topSub}px; left: {leftSub}px"
            >
                {#each submenuItems as item, index}
                    {#if item.label === '---'}
                        <hr class="contextmenu-hr" />
                    {:else}
                        <button
                            class="contextmenu-button"
                            onclick={(event) => onClick(event, item, index)}
                        >
                            {item.label}
                            {#if item.shortcut}
                                <span class="contextmenu-shortcut">{item.shortcut}</span>
                            {/if}
                        </button>
                    {/if}
                {/each}
            </nav>
        {/if}
    </div>
{/if}
