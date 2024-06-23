<svelte:options accessors={true}/> <!-- this option lets us set the items props after the component has been created -->

<script>import { clickOutsideConditional } from "./svelte-utils/index.js";
import { tick } from "svelte";
import { FreLogger, MenuItem, FreEditor } from "@freon4dsl/core";
import { contextMenuVisible } from "./svelte-utils/ContextMenuStore.js";
import { viewport } from "./svelte-utils/EditorViewportStore.js";
export let items;
export let editor;
const LOGGER = new FreLogger("ContextMenu");
let submenuItems;
let elementIndex;
let menuHeight = 0, menuWidth = 0;
let top = 0, left = 0;
let submenuHeight = 0, submenuWidth = 0;
let topSub = 0, leftSub = 0;
let itemHeight = 40;
let submenuOpen = false;
export async function show(event, index) {
  LOGGER.log("CONTEXTMENU show for index " + index);
  elementIndex = index;
  $contextMenuVisible = true;
  submenuOpen = false;
  await tick();
  let posX = event.pageX - $viewport.left;
  let posY = event.pageY - $viewport.top;
  left = calculatePos($viewport.width, menuWidth, posX);
  top = calculatePos($viewport.height, menuHeight, posY);
}
export function hide() {
  LOGGER.log("CONTEXTMENU hide");
  $contextMenuVisible = false;
  submenuOpen = false;
}
async function openSub(itemIndex) {
  submenuOpen = true;
  await tick();
  topSub = top + itemHeight + itemIndex * (itemHeight + 2 + 3 + 4);
  leftSub = left + submenuWidth - 20;
  topSub = calculatePos($viewport.width, submenuWidth, topSub);
  leftSub = calculatePos($viewport.height, submenuHeight, leftSub);
}
function calculatePos(editor2, menu, mouse) {
  let result;
  if (editor2 - mouse < menu) {
    result = mouse - menu;
  } else {
    result = mouse;
  }
  if (result < 0) {
    result = 0;
  }
  return result;
}
function getContextMenuDimension(node) {
  menuHeight = node.offsetHeight;
  menuWidth = node.offsetWidth;
}
function getSubMenuDimension(node) {
  submenuHeight = node.offsetHeight;
  submenuWidth = node.offsetWidth;
}
function onClick(event, item, itemIndex) {
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

