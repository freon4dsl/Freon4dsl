<script>import {
  GridBox,
  isMetaKey,
  ENTER,
  FreLogger,
  GridCellBox,
  Box
} from "@freon4dsl/core";
import { afterUpdate, onMount } from "svelte";
import RenderComponent from "./RenderComponent.svelte";
import { componentId } from "./svelte-utils/index.js";
import { executeCustomKeyboardShortCut, isOdd } from "./svelte-utils/index.js";
export let grid;
export let cellBox;
export let editor;
const LOGGER = new FreLogger("GridCellComponent");
let contentBox;
let id = !!cellBox ? componentId(cellBox) : "gridcell-for-unknown-box";
let row;
let column;
let int = 0;
let orientation = "gridcellNeutral";
let isHeader = "noheader";
let cssStyle = "";
let cssClass = "";
let htmlElement;
function refresh(from) {
  if (!!cellBox) {
    LOGGER.log("REFRESH GridCellComponent " + (!!from ? " from " + from + " " : "") + cellBox?.element?.freLanguageConcept() + "-" + cellBox?.element?.freId());
    LOGGER.log("GridCellComponent row/col " + cellBox.$id + ": " + cellBox.row + "," + cellBox.column + "  span " + cellBox.rowSpan + "," + cellBox.columnSpan + "  box " + cellBox.content.role + "--- " + int++);
    contentBox = cellBox.content;
    row = cellBox.row + (cellBox.rowSpan ? " / span " + cellBox.rowSpan : "");
    column = cellBox.column + (cellBox.columnSpan ? " / span " + cellBox.columnSpan : "");
    orientation = grid.orientation === "neutral" ? "gridcellNeutral" : grid.orientation === "row" ? isOdd(cellBox.row) ? "gridcellOdd" : "gridcellEven" : isOdd(cellBox.column) ? "gridcellOdd" : "gridcellEven";
    if (cellBox.isHeader) {
      isHeader = "gridcell-header";
    }
    cssStyle = contentBox.cssStyle;
    cssClass = cellBox.cssClass;
  }
}
async function setFocus() {
  htmlElement.focus();
}
onMount(() => {
  cellBox.refreshComponent = refresh;
  cellBox.setFocus = setFocus;
});
afterUpdate(() => {
  cellBox.refreshComponent = refresh;
  cellBox.setFocus = setFocus;
});
const onKeydown = (event) => {
  LOGGER.log("GridCellComponent onKeyDown");
  if (isMetaKey(event) || event.key === ENTER) {
    LOGGER.log("Keyboard shortcut in GridCell ===============");
    const index = cellBox.propertyIndex;
    executeCustomKeyboardShortCut(event, index, cellBox, editor);
  }
};
$: {
  refresh(cellBox?.id);
}
</script>

<div
        class="gridcellcomponent {orientation} {isHeader} {cssClass}"
        style:grid-row="{row}"
        style:grid-column="{column}"
        style="{cssStyle}"
        on:keydown={onKeydown}
        id="{id}"
        tabIndex={0}
        bind:this={htmlElement}
>
    <RenderComponent box={contentBox} editor={editor}/>
</div>

<style>
    .gridcellcomponent {
        box-sizing: border-box;
        align-self: baseline;
        justify-self: var(--freon-gridcell-component-justify-left, baseline);
        display: flex;
        padding: var(--freon-gridcell-component-padding, 1px);
        /*background-color: var(--freon-gridcell-component-background-color, white);*/
        color: var(--freon-gridcell-component-color, inherit);
    }
</style>
