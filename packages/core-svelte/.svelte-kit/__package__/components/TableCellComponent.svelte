<svelte:options immutable={true}/>
<script>import {
  isMetaKey,
  ENTER,
  FreLogger,
  TableCellBox,
  FreLanguage,
  TableDirection,
  Box,
  isActionBox,
  ListElementInfo,
  MenuOptionsType,
  FreUtils,
  isTableRowBox,
  TableRowBox
} from "@freon4dsl/core";
import { onMount, createEventDispatcher, afterUpdate } from "svelte";
import RenderComponent from "./RenderComponent.svelte";
import { componentId } from "./svelte-utils/index.js";
import {
  activeElem,
  activeIn,
  draggedElem,
  draggedFrom,
  selectedBoxes
} from "./svelte-utils/DropAndSelectStore.js";
import { contextMenu, contextMenuVisible } from "./svelte-utils/ContextMenuStore.js";
export let box;
export let editor;
export let parentComponentId;
export let parentOrientation;
export let myMetaType;
const LOGGER = new FreLogger("TableCellComponent");
const dispatcher = createEventDispatcher();
let id = !!box ? `cell-${componentId(box)}` : "table-cell-for-unknown-box";
let row;
let column;
let orientation = "gridcellNeutral";
let childBox;
let htmlElement;
let isHeader = "noheader";
let cssStyle = "";
let cssClass = "";
const img = new Image();
img.src = "img/freonlogo.png";
const refresh = (why) => {
  LOGGER.log("TableCellComponent refresh, why: " + why);
  if (!!box) {
    if (parentOrientation === TableDirection.HORIZONTAL) {
      row = box.row;
      column = box.column;
    } else {
      row = box.column;
      column = box.row;
    }
    childBox = box.content;
    myMetaType = box.conceptName;
  }
  LOGGER.log("    refresh row, col = " + row + ", " + column);
};
async function setFocus() {
  htmlElement.focus();
}
onMount(() => {
  box.refreshComponent = refresh;
  row = box.row;
  column = box.column;
});
afterUpdate(() => {
  box.refreshComponent = refresh;
  let isSelected2 = $selectedBoxes.includes(box);
  cssClass = isSelected2 ? "selected" : "unSelected";
});
const onKeydown = (event) => {
  LOGGER.log("GridCellComponent onKeyDown");
  if (isMetaKey(event) || event.key === ENTER) {
    LOGGER.log("Keyboard shortcut in GridCell ===============");
    let index = parentOrientation === TableDirection.HORIZONTAL ? row : column;
  }
};
$: {
  refresh("New TableCellComponent created for " + box?.id);
}
const drop = (event) => {
  LOGGER.log("drop, dispatching");
  dispatcher("dropOnCell", { row, column });
};
const dragstart = (event) => {
  LOGGER.log("dragStart");
  $contextMenuVisible = false;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.dropEffect = "move";
  editor.selectElementForBox(box);
  event.dataTransfer.setDragImage(img, 0, 0);
  $draggedElem = new ListElementInfo(box.element, parentComponentId);
  $draggedFrom = parentComponentId;
};
const dragenter = (event) => {
  if (FreLanguage.getInstance().metaConformsToType($draggedElem.element, myMetaType)) {
    $activeElem = { row, column };
    $activeIn = parentComponentId;
  }
  return false;
};
const mouseout = () => {
  $activeElem = null;
  $activeIn = "";
  return false;
};
function showContextMenu(event) {
  let index;
  FreUtils.CHECK(isTableRowBox(box.parent));
  let parent = box.parent;
  if (isActionBox(box.content)) {
    $contextMenu.items = box.options(MenuOptionsType.placeholder);
    index = Number.MAX_VALUE;
  } else if (parent.isHeader) {
    $contextMenu.items = box.options(MenuOptionsType.header);
    index = -1;
  } else {
    $contextMenu.items = box.options(MenuOptionsType.normal);
    index = box.propertyIndex;
  }
  if (editor.selectedBox !== box) {
    if (isActionBox(box.content) || parent.isHeader) {
      $selectedBoxes = [...parent.children];
    } else {
      editor.selectElementForBox(box);
    }
  }
  $contextMenu.show(event, index);
}
let isSelected;
$: isSelected = box.content.selectable ? $selectedBoxes.includes(box) || $selectedBoxes.includes(box.content) : false;
</script>


<!-- on:focus is here to avoid a known bug in svelte 3.4*: "A11y: on:mouseover must be accompanied by on:focus with Svelte v3.40 #285" -->
<!-- Likewise on:blur is needed for on:mouseout -->
<!-- Apparently, we cannot combine multiple inline style directives, as in -->
<!--  style="grid-row: '{row}' grid-column: '{column}' {cssStyle}"-->

<span
        id="{id}"
        class="gridcellcomponent {orientation} {isHeader} {cssClass} "
        style:grid-row="{row}"
        style:grid-column="{column}"
        style="{cssStyle}"
        draggable=true
        on:keydown={onKeydown}
        on:dragstart|stopPropagation={event => dragstart(event)}
        on:drop|stopPropagation={event => drop(event)}
        ondragover="return false"
        on:dragenter|stopPropagation={(event) => dragenter(event)}
        on:mouseout|stopPropagation={mouseout}
        on:focus={() => {}}
        on:blur={() => {}}
        on:keydown={onKeydown}
        on:contextmenu|stopPropagation|preventDefault={(event) => showContextMenu(event)}
        tabIndex={0}
        bind:this={htmlElement}
>
    <RenderComponent box={childBox} editor={editor}/>
</span>


<style>
    .gridcellcomponent {
        box-sizing: border-box;
        align-self: baseline; /* isn't this the default? */
        justify-self: var(--freon-gridcell-component-justify-left, baseline);
        padding: var(--freon-gridcell-component-padding, 1px);
        background-color: var(--freon-gridcell-component-background-color, transparent);
        color: var(--freon-gridcell-component-color, inherit);
    }

    .unSelected {
        background: transparent;
        border: none;
    }
    .selected {
        background-color: var(--freon-selected-background-color, rgba(211, 227, 253, 255));
        outline-color: var(--freon-selected-outline-color, darkblue);
        outline-style: var(--freon-selected-outline-style, solid);
        outline-width: var(--freon-selected-outline-width, 1px);
    }
</style>
