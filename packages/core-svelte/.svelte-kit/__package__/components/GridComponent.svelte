<script>import { GridCellBox, FreLogger } from "@freon4dsl/core";
import { afterUpdate, onMount } from "svelte";
import GridCellComponent from "./GridCellComponent.svelte";
import { componentId } from "./svelte-utils/index.js";
const LOGGER = new FreLogger("GridComponent");
export let box;
export let editor;
let id;
let cells;
let templateColumns;
let templateRows;
let cssClass = "";
let htmlElement;
const refresh = (why) => {
  LOGGER.log("refresh " + why);
  if (!!box) {
    id = componentId(box);
    cells = [...box.cells];
    length = cells.length;
    templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
    templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
    cssClass = box.cssClass;
  } else {
    id = "grid-for-unknown-box";
  }
};
async function setFocus() {
  htmlElement.focus();
}
onMount(() => {
  LOGGER.log("GridComponent onmount");
  box.refreshComponent = refresh;
  box.setFocus = setFocus;
});
afterUpdate(() => {
  LOGGER.log("GridComponent afterUpdate for girdBox " + box.element.freLanguageConcept());
  box.refreshComponent = refresh;
  box.setFocus = setFocus;
});
let dummy = 0;
$: {
  refresh(box?.$id);
}
</script>

<div
        style:grid-template-columns="{templateColumns}"
        style:grid-template-rows="{templateRows}"
        class="maingridcomponent {cssClass}"
        id="{id}"
        tabIndex={0}
        bind:this={htmlElement}
>
    {#each cells as cell (cell?.content?.element?.freId() + "-" + cell?.content?.id + cell?.role + "-grid")}
        <GridCellComponent grid={box} cellBox={cell} editor={editor}/>
    {/each}
</div>

<style>
    .maingridcomponent {
        display: inline-grid;
        /*grid-gap: 2px;*/

        align-items: center;
        align-content: center;
        justify-items: center;
        border-color: var(--freon-grid-component-border-color, darkgreen);
        border-width: var(--freon-grid-component-border-width, 1pt);
        border-style: var(--freon-grid-component-border-style, dot-dot-dash);
    }
</style>
