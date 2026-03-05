<script lang="ts">
    import { CONTEXTMENU_LOGGER } from './ComponentLoggers.js';

    /**
     *  This component combines a menu with a submenu. The positions of both the menu and the submenu are determined
     *  such that the complete menu stays within the boundaries of the editor viewport. The state of the editor
     *  viewport is stored in the EditorViewportStore (by FreonComponent).
     */
    import { clickOutsideConditional } from './svelte-utils/ClickOutside.js';
    import { type MainComponentProps } from './svelte-utils/FreComponentProps.js';
    import { tick } from 'svelte';
    import { MenuItem } from '@freon4dsl/core';
    import { contextMenuVisible } from './stores/AllStores.svelte.js';
    import { usePaneContext, portal, useOverlayListeners } from "./svelte-utils/OverlayPane.js"

    // props
    let { editor }: MainComponentProps = $props();

    const pane = usePaneContext();
    let overlayRoot = $derived(pane?.getOverlayRoot() ?? null)

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

    const listeners = useOverlayListeners(() => ({
        pane,
        enabled: contextMenuVisible.value,
        closeFunc: hide,
        inside: [panelEl],
        closeOnResize: true,
    }));

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

        // attach listeners for scrolling
        listeners.attach();

        // wait for the menu to be rendered, because we need its sizes for the positioning
        await tick();
        // get the position of the mouse relative to the editor view
        getContextMenuPosition(event);
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
        let x = event.clientX - ox;
        let y = event.clientY - oy;

        // clamp within overlay bounds
        x = Math.max(0, Math.min(x, ow - menuWidth));
        y = Math.max(0, Math.min(y, oh - menuHeight));

        left = x;
        top = y;

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
        let y = top + itemIndex * itemHeight;
        // prefer right
        let x = left + menuWidth - 10;
        // if overflow right, open left
        if (x + submenuWidth > ow) {
            x = left - submenuWidth + 10;
        }

        // clamp inside overlay
        x = Math.max(0, Math.min(x, ow - submenuWidth));
        y = Math.max(0, Math.min(y, oh - submenuHeight));

        leftSub = x;
        topSub = y;
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
        use:clickOutsideConditional={{ enabled: contextMenuVisible.value }}
        onclick_outside={hide}
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

<style>
    /* The panel lives in the fixed overlay. Let it receive pointer events. */
    .context-menu-panel {
        pointer-events: auto;
    }

    /* Make sure menus position correctly within the overlay layer. */
    .contextmenu {
        position: absolute;
    }
</style>
