<svelte:options accessors={true}/> <!-- this option lets us set the items props after the component has been created -->

<script lang="ts">
    /**
     *  This component combines a menu with a submenu. The positions of both the menu and the submenu are determined
     *  such that the complete menu stays within the bounderies of the editor viewport. The state of the editor
     *  viewport is stored in the EditorViewportStore (by FreonComponent).
     */
    import { clickOutsideConditional } from "./svelte-utils";
    import { tick } from "svelte";
    import { FreLogger, MenuItem, FreEditor } from "@freon4dsl/core";
    import { contextMenuVisible } from "./svelte-utils/ContextMenuStore";
    import { viewport } from "./svelte-utils/EditorViewportStore";

    // items for the context menu
    export let items: MenuItem[];
    export let editor: FreEditor;

    // local variables
    const LOGGER = new FreLogger("ContextMenu"); //.mute();
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
        await tick(); // wait in order to detemrine the size of the submenu
        // determine the 'normal' position of the sub menu, which is
        // (itemHeight px) lower than the main menu, 20 px left to the end of the item
        topSub = top + itemHeight + itemIndex * (itemHeight + 2 + 3 + 4); // add 2 for gap, 3 for margin, 4 for padding
        leftSub = left + submenuWidth - 20;
        // calculate the right position of the sub menu based on the size of the editor view
        topSub = calculatePos($viewport.width, submenuWidth, topSub);
        leftSub = calculatePos($viewport.height, submenuHeight, leftSub);
    }

    /**
     * This calculates the position of the context- or sub-menu, either on x-axis or y-axis
     */
    function calculatePos(editor: number, menu: number, mouse: number): number {
        let result: number;
        // see if the menu will fit in the editor view, if not: position it left/up, not right/down of the mouse click
        if (editor - mouse < menu) {
            result = mouse - menu;
        } else {
            result = mouse;
        }
        // if the result should be outside the editor view, then position it on the leftmost/uppermost point
        if (result < 0) {
            result = 0;
        }
        return result;
    }

    /**
     * This function finds the context menu dimensions the moment that
     * $contextMenuVisible becomes true and the menu is shown.
     */
    function getContextMenuDimension(node: HTMLElement) {
        menuHeight = node.offsetHeight;
        menuWidth = node.offsetWidth;
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
            item.handler(editor.selectedBox.element, elementIndex, editor);
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
                    <hr/>
                {:else}
                    <button on:click={(event) => onClick(event, item, index)} bind:clientHeight={itemHeight}>
                        {item.label}
                        {#if item.shortcut}
                            <span class="shortcut">{item.shortcut}</span>
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
                        <hr/>
                    {:else}
                        <button on:click={(event) => onClick(event, item, index)}>
                            {item.label}
                            {#if item.shortcut}
                                <span class="shortcut">{item.shortcut}</span>
                            {/if}
                        </button>
                    {/if}
                {/each}
            </nav>
        {/if}
    {/if}
</div>

<style>
    .contextmenu {
        display: flex;
        flex-direction: column;
        border: solid 1px #c5c5c5;
        border-radius: 3px;
        gap: 2px;
        position: absolute; /* relative to a 'relative' parent */
        background: #e5e5e5;
        min-width: 120px;
        box-shadow: 1.5px 1.5px 5px grey;
    }

    button {
        background: none;
        border: none;
        border-radius: 2px;
        padding: 4px;
        margin: 3px;
        cursor: pointer;
        text-align: left;
        display: flex;
        justify-content: space-between;
        gap: 2px;
        place-items: center;
    }

    button:hover {
        background: #f4f4f4;
    }

    .shortcut {
        color: #666;
        font-size: 0.7em;
    }

    hr {
        border-top: solid 1px #c5c5c5;
        width: 100%;
        margin: 0;
    }
</style>

