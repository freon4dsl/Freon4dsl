<svelte:options accessors={true}/>
<!-- this option lets us set the items prop after the component has been created -->

<script lang="ts">
    import { clickOutside } from './svelte-utils/clickOutside';
    import {tick} from "svelte";
    import {PiEditor} from "@projectit/core";
    import {contextMenuVisible, MenuItem} from "./svelte-utils/ContextMenuStore";
    import {selectedBoxes} from "./svelte-utils/DropAndSelectStore";
    import {viewport} from "./svelte-utils/EditorViewportStore";

    // export let editor: PiEditor;

    // items for the context menu
    export let items: MenuItem[];
    let submenuItems: MenuItem[];

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

    let contextmenu, submenu: HTMLElement;

    /**
     * This function shows the context menu
     * @param event
     */
    export async function show(event: MouseEvent) {
        // todo determine the items based on the box to which the menu is coupled
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
        $contextMenuVisible = false;
        submenuOpen = false;
    }

    /**
     * This function hides the sub menu only, the context menu is still shown.
     * It is used when the sub menu is shown but the user clicks on another part of the contextmenu.
     * todo see if this is still needed
     */
    function hidesubmenu() {
        $contextMenuVisible = false;
        submenuOpen = false;
    }

    /**
     * This function shows the sub menu
     */
    async function openSub(itemIndex) {
        submenuOpen = true;
        await tick();
        // determine the 'normal' position of the sub menu:
        // (itemHeight px) lower than the main menu, 20 px left to the end of the item
        topSub = top + itemHeight + itemIndex * (itemHeight + 2 + 3 + 4); // add 2 for gap, 3 for margin, 4 for padding
        leftSub = left + submenuWidth - 20;
        // calculate the right position of the sub menu based on the size of the editor view
        topSub = calculatePos($viewport.width, submenuWidth, topSub);
        leftSub = calculatePos($viewport.height, submenuHeight, leftSub);
    }

    /**
     * This calculates the position of the context or sub menu, either on x-axis or y-axis
     */
    function calculatePos(editor: number, menu: number, mouse: number): number {
        let result: number;
        // see if the menu will fit in the editor view, if not: position it left/up, not right/down of the mouse click
        if (editor - mouse < menu) {
            result = mouse - menu
        } else {
            result = mouse;
        }
        // if the result should be outside the editor view, then position it on the leftmost/uppermost point
        if (result < 0) result = 0;
        return result;
    }

    /**
     * This function gets the context menu dimensions the moment that
     * $contextMenuVisible becomes true and the menu is shown.
     */
    function getContextMenuDimension(node){
        menuHeight = node.offsetHeight;
        menuWidth = node.offsetWidth;
    }

    /**
     * This function gets the sub menu dimensions the moment that
     * submenuOpen becomes true and the menu is shown.
     */
    function getSubMenuDimension(node){
        submenuHeight = node.offsetHeight;
        submenuWidth = node.offsetWidth;
    }

    function onClick(event: MouseEvent, item: MenuItem, itemIndex: number): boolean {
        submenuOpen = false;
        if (item.hasSubItems()) {
            submenuItems = item.subItems;
            openSub(itemIndex);
        } else {
            // todo adjust for multiple selections
            console.log('DOING IT for ' + $selectedBoxes[0].element.piId())
            item.handler($selectedBoxes[0].element);
            hide();
        }
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
</script>

<div          use:clickOutside
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

