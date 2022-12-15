<script lang="ts">
    import { GridCellBox, type GridBox, type PiEditor } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { MOUNT_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import GridCellComponent from "./GridCellComponent.svelte";
    import { writable, type Writable } from "svelte/store";
    import { componentId } from "./util";

    export let box: GridBox;
    export let editor: PiEditor;

    let id = componentId(box);
    let cells: Writable<GridCellBox[]> = writable<GridCellBox[]>(box.cells);
    let templateColumns: string;
    let templateRows: string;
    let cssClass: string = "";

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
        MOUNT_LOGGER.log("GridComponent onmount")
        $cells = box.cells;
        box.refreshComponent = refresh;

    })
    afterUpdate(() => {
        UPDATE_LOGGER.log("GridComponent afterUpdate for girdBox " + box.element.piLanguageConcept())
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
    {#each $cells as cell (cell.box.element.piId() + "-" + cell.box.id + cell.role + "-grid" + "-" + dummy)}
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
