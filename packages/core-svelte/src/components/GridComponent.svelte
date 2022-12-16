<script lang="ts">
    import { GridCellBox, type GridBox, type PiEditor, PiLogger } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import GridCellComponent from "./GridCellComponent.svelte";
    import { componentId } from "./util";

    const LOGGER = new PiLogger("GridComponent"); //.mute();

    export let box: GridBox;
    export let editor: PiEditor;

    let id = componentId(box);
    let cells: GridCellBox[];
    $: cells = box.cells;
    let templateColumns: string;
    $: templateColumns = `repeat(${box.numberOfRows() - 1}, auto)`;
    let templateRows: string;
    $: templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
    let cssClass: string = "";
    $: cssClass = box.cssClass;

    const refresh = (why?: string): void =>  {
        if (!!box) {
            // console.log("REFRESH GridComponent " + box?.element?.piLanguageConcept() + "-" + box?.element?.piId());
            $cells = [...box.cells];

            length = $cells.length;
            templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
            templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
            cssClass = box.cssClass;
        }
    }
    onMount( () => {
        LOGGER.log("GridComponent onmount")
        $cells = box.cells;
        box.refreshComponent = refresh;

    })
    afterUpdate(() => {
        LOGGER.log("GridComponent afterUpdate for girdBox " + box.element.piLanguageConcept())
        $cells = box.cells;
        box.refreshComponent = refresh;
    });

    let dummy = 0;

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
</script>

<div
        style:grid-template-columns="{templateColumns}"
        style:grid-template-rows="{templateRows}"
        class="maingridcomponent {cssClass}"
        id="{id}"
>
    {#each cells as cell (cell.box.element.piId() + "-" + cell.box.id + cell.role + "-grid")}
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
        border-style: var(--freon-grid-component-border-style, solid);
    }
</style>
