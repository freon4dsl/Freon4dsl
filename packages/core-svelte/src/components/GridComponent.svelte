<script lang="ts">
    import { GridCellBox, type GridBox, type PiEditor, PiLogger } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import GridCellComponent from "./GridCellComponent.svelte";
    import { autorun } from "mobx";
    import { writable, type Writable } from "svelte/store";

    const LOGGER = new PiLogger("GridComponent"); //.mute();

    export let box: GridBox;
    export let editor: PiEditor;

    let id: string;                             // an id for the html element showing the list
    id = !!box ? box.id : "list-with-unknown-box";

    onMount( () => {
        LOGGER.log("GridComponent onmount")
        $cells = box.cells;
    })

    afterUpdate(() => {
        LOGGER.log("GridComponent afterUpdate for girdBox " + box.element.piLanguageConcept())
        $cells = box.cells;
        // Triggers autorun
        // notifier.notifyChange();
    });
    let cells: Writable<GridCellBox[]> = writable<GridCellBox[]>(box.cells); // todo see whether we can do without this store
    let templateColumns: string;
    let templateRows: string;

    let cssClass: string = "";
    // TODO either use svelte store for cells or mobx observable???
    autorun(() => {
        $cells = [...box.cells];
        length = $cells.length;

        templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
        templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
        cssClass = box.cssClass;
    });
</script>

<div
        style:grid-template-columns="{templateColumns}"
        style:grid-template-rows="{templateRows}"
        class="maingridcomponent {cssClass}"
        id="{id}"
>
    {#each $cells as cell (cell.content.element.piId() + "-" + cell.content.id + cell.role + "-grid")}
        <GridCellComponent grid={box} box={cell} editor={editor}/>
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
