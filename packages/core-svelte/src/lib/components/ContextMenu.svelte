<svelte:options accessors={true}/> <!-- this option lets us set the items props after the component has been created -->

<script lang="ts">
    import { CONTEXTMENU_LOGGER } from "$lib/components/ComponentLoggers.js";

    /**
     *  This component combines a menu with a submenu. The positions of both the menu and the submenu are determined
     *  such that the complete menu stays within the bounderies of the editor viewport. The state of the editor
     *  viewport is stored in the EditorViewportStore (by FreonComponent).
     */
    import { calculatePos, clickOutsideConditional, contextMenuVisible, viewport } from "./svelte-utils/index.js";
    import { tick } from "svelte";
    import { FreLogger, MenuItem, FreEditor } from "@freon4dsl/core";

    // items for the context menu
    export let items: MenuItem[];
    export let editor: FreEditor;

    // local variables
    const LOGGER = CONTEXTMENU_LOGGER;
    let submenuItems: MenuItem[];
    let elementIndex: number;                   // the index of the element in a list to which this menu is coupled

    // dimension (height and width) of context menu
    let menuHeight = 0, menuWidth = 0;
    // position of context menu
    let top = 0, left = 0;
    // dimension (height and width) of sub menu
    let submenuHeight = 0, submenuWidth = 0;
    // position of sub menu
    let topSub = 0, leftSub = 0;
    // height of items in menu and sub menu
    let itemHeight = 40;
    let submenuOpen = false;

    // let contextmenu: HTMLElement;
    // let submenu: HTMLElement;

    /**
     * This function shows the context menu. Note that the items to be shown should
     * already be set (based on the box to which the menu is coupled)
     * @param event
     */
    export async function show(event: MouseEvent, index: number) {
        LOGGER.log("CONTEXTMENU show for index " + index);
        elementIndex = index;
        $contextMenuVisible = true;
        submenuOpen = false;
        // wait for the menu to be rendered, because we need its sizes for the positioning
        await tick();
        // get the position of the mouse relative to the editor view
        let posX: number = event.pageX - $viewport.left;
        let posY: number = event.pageY - $viewport.top;
        // calculate the right position of the context menu
        left = calculatePos($viewport.width, menuWidth, posX);
        top = calculatePos($viewport.height, menuHeight, posY);
    }

    /**
     * This function hides the context menu
     */
    export function hide() {
        LOGGER.log("CONTEXTMENU hide");
        $contextMenuVisible = false;
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
        // calculate the right position of the sub menu based on the size of the editor view
        topSub = calculatePos($viewport.width, submenuWidth, topSub);
        leftSub = calculatePos($viewport.height, submenuHeight, leftSub);
    }

    /**
     * This function finds the context menu dimensions the moment that
     * $contextMenuVisible becomes true and the menu is shown.
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
        LOGGER.log("CONTEXTMENU onClick");
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

<div use:clickOutsideConditional={{enabled: $contextMenuVisible}}
     on:click_outside={hide}>
    {#if $contextMenuVisible}
        <nav use:getContextMenuDimension
             class="contextmenu"
             style="top: {top}px; left: {left}px"
        >
            {#each items as item, index}
                {#if item.label === '---'}
                    <hr class="contextmenu-hr"/>
                {:else}
                    <button class="contextmenu-button" on:click={(event) => onClick(event, item, index)} bind:clientHeight={itemHeight}>
                        {item.label}
                        {#if item.shortcut}
                            <span class="contextmenu-shortcut">{item.shortcut}</span>
                        {/if}
                    </button>
                {/if}
            {/each}
        </nav>
        {#if submenuOpen}
            <nav use:getSubMenuDimension
                 class="contextmenu"
                 style="top: {topSub}px; left: {leftSub}px"
            >
                {#each submenuItems as item, index}
                    {#if item.label === '---'}
                        <hr class="contextmenu-hr"/>
                    {:else}
                        <button class="contextmenu-button" on:click={(event) => onClick(event, item, index)}>
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


