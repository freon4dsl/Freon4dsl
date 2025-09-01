<script lang="ts">
    import { CONTEXTMENU_LOGGER } from '$lib/components/ComponentLoggers.js';

    /**
     *  This component combines a menu with a submenu. The positions of both the menu and the submenu are determined
     *  such that the complete menu stays within the boundaries of the editor viewport. The state of the editor
     *  viewport is stored in the EditorViewportStore (by FreonComponent).
     */
    import { calculatePos } from './svelte-utils/CommonFunctions.js';
    import { clickOutsideConditional } from './svelte-utils/ClickOutside.js';
    import { type MainComponentProps } from './svelte-utils/FreComponentProps.js';
    import { tick } from 'svelte';
    import { type ClientRectangle, MenuItem } from '@freon4dsl/core';
    import { contextMenuVisible } from './stores/AllStores.svelte.js';

    // items for the context menu
    let { editor }: MainComponentProps = $props();

    // local variables
    const LOGGER = CONTEXTMENU_LOGGER;
    let _items: MenuItem[] = $state([]);
    let submenuItems: MenuItem[] = $state([]);
    let elementIndex: number; // the index of the element in a list to which this menu is coupled

    // browser/window dimension (height and width)
    let innerWidth = $state(0);
    let innerHeight = $state(0);
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
        // get the position of the mouse relative to the editor view
        getContextMenuPosition(event);
    }

    /** This function is used to get the position of the context menu. */
    function getContextMenuPosition(event: MouseEvent) {
        const rect: ClientRectangle = editor.getClientRectangle();
        // Because there can be a navigation bar or anything else above the editor element,
        // and we have to position the context menu in the editor element,
        // we use this calculation instead of event.clientX and event.clientY.
        top = event.pageY - rect.y;
        left = event.pageX - rect.x;
        // Determine whether the menu would be shown within the viewport.
        // Use the event.clientXY for this because this is the distance between the mouse click and the top/left side
        // of the window. The height/width of the window must be able to contain the menu at this position.
        if (innerHeight < event.clientY + menuHeight)
            top = top - menuHeight;
        if (innerWidth < event.clientX + menuWidth)
            left = left - menuWidth;
        LOGGER.log(`ContextMenu posX: ${left}, posY: ${top}, event.pageX: ${event.pageX}, event.pageY: ${event.pageY},
event.clientX: ${event.clientX}, event.clientY: ${event.clientY}, innerwidth: ${innerWidth}, innerHeight: ${innerHeight},
editor: ${rect.x} ${rect.y} ${rect.height} ${rect.width}`);
    }

    /**
     * This function hides the context menu
     */
    export function hide() {
        LOGGER.log('CONTEXTMENU hide');
        contextMenuVisible.value = false;
        submenuOpen = false;
    }

    /**
     * This function shows the sub menu
     */
    async function openSub(itemIndex: number) {
        submenuOpen = true;
        await tick(); // wait in order to determine the size of the submenu
        // determine the 'normal' position of the sub menu, which is
        // (itemHeight px) lower than the main menu, 20 px left to the end of the item
        topSub = top + itemHeight + itemIndex * (itemHeight + 2 + 3 + 4); // add 2 for gap, 3 for margin, 4 for padding
        leftSub = left + submenuWidth - 20;
        // calculate the right position of the sub menu based on the size of the viewport
        topSub = calculatePos(innerWidth, submenuWidth, topSub);
        leftSub = calculatePos(innerHeight, submenuHeight, leftSub);
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

<svelte:window bind:innerWidth bind:innerHeight />

<div use:clickOutsideConditional={{ enabled: contextMenuVisible.value }} onclick_outside={hide}>
    {#if contextMenuVisible.value}
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
    {/if}
</div>
