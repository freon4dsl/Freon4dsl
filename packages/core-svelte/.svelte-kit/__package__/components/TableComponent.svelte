<svelte:options immutable={true}/>
<script>import {
  FreLogger,
  ListElementInfo,
  TableDirection,
  GridCellBox,
  isTableRowBox,
  isElementBox,
  TableCellBox
} from "@freon4dsl/core";
import { afterUpdate, onMount } from "svelte";
import { activeElem, activeIn, componentId, draggedElem, draggedFrom } from "./svelte-utils/index.js";
import { dropListElement, moveListElement } from "@freon4dsl/core";
import TableCellComponent from "./TableCellComponent.svelte";
const LOGGER = new FreLogger("TableComponent");
export let box;
export let editor;
let id = !!box ? componentId(box) : "table-for-unknown-box";
let cells;
let templateColumns;
let templateRows;
let cssClass;
let htmlElement;
let elementType;
const refresh = (why) => {
  LOGGER.log("Refresh TableBox, box: " + why);
  if (!!box) {
    cells = getCells();
    templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
    templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
    cssClass = box.cssClass;
    elementType = box.conceptName;
  }
};
async function setFocus() {
  htmlElement.focus();
}
function getCells() {
  const _cells = [];
  box.children.forEach((ch) => {
    if (isElementBox(ch)) {
      const rowBox = ch.content;
      if (isTableRowBox(rowBox)) {
        _cells.push(...rowBox.cells);
      }
    } else if (isTableRowBox(ch)) {
      _cells.push(...ch.cells);
    }
  });
  return _cells;
}
onMount(() => {
  box.refreshComponent = refresh;
  box.setFocus = setFocus;
  for (const child of box.children) {
    if (isTableRowBox(child)) {
      child.refreshComponent = refresh;
    } else if (isElementBox(child) && isTableRowBox(child.content)) {
      child.refreshComponent = refresh;
    }
  }
});
afterUpdate(() => {
  box.refreshComponent = refresh;
  box.setFocus = setFocus;
  for (const child of box.children) {
    if (isTableRowBox(child)) {
      child.refreshComponent = refresh;
    } else if (isElementBox(child) && isTableRowBox(child.content)) {
      child.content.refreshComponent = refresh;
    }
  }
});
$: {
  refresh("Refresh new box: " + box?.id);
}
const drop = (event) => {
  const data = $draggedElem;
  let targetIndex = event.detail.row - 1;
  if (box.direction === TableDirection.VERTICAL) {
    targetIndex = event.detail.column - 1;
  }
  if (box.hasHeaders) {
    targetIndex = targetIndex - 1;
  }
  if (data.componentId === id) {
    moveListElement(box.element, data.element, box.propertyName, targetIndex);
  } else {
    dropListElement(editor, data, elementType, box.element, box.propertyName, targetIndex);
  }
  $draggedElem = null;
  $draggedFrom = "";
  $activeElem = { row: -1, column: -1 };
  $activeIn = "";
};
</script>

<span
        style:grid-template-columns="{templateColumns}"
        style:grid-template-rows="{templateRows}"
        class="maingridcomponent {cssClass}"
        id="{id}"
        tabIndex={0}
        bind:this={htmlElement}
>
    {#each cells as cell (cell.content.id + '-' + cell.row + '-' + cell.column)}
        <TableCellComponent
                box={cell}
                editor={editor}
                parentComponentId={id}
                parentOrientation={box.direction}
                parentHasHeader={box.hasHeaders}
                myMetaType={elementType}
                on:dropOnCell={drop}/>
    {/each}
</span>


<style>
    .maingridcomponent {
        display: inline-grid;
        grid-gap: 2px;
        align-items: center; /* place-items is an abbreviation for align-items and justify-items */
        justify-items: center;
        align-content: center;
        border-color: var(--freon-grid-component-border-color, darkgreen);
        border-width: var(--freon-grid-component-border-width, 1pt);
        border-style: var(--freon-grid-component-border-style, dashed);
        border-radius: 4px;
    }
</style>
