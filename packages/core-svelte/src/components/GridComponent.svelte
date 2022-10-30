<script lang="ts">
    import { GridCellBox, type GridBox, type PiEditor } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { ChangeNotifier, MOUNT_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import GridCellComponent from "./GridCellComponent.svelte";
    import { autorun } from "mobx";
    import { writable, type Writable } from "svelte/store";
    import { optionalBox } from "./OptionalComponent.svelte";
    import { componentId } from "./util";

    export let gridBox: GridBox;
    export let editor: PiEditor;

    let notifier = new ChangeNotifier();
    let id = componentId(gridBox);

    const dirty = (): void =>  {
        console.log("DIRTY GridComponent ");
    }

    onMount( () => {
        MOUNT_LOGGER.log("GridComponent onmount")
        $cells = gridBox.cells;
    })

    afterUpdate(() => {
        UPDATE_LOGGER.log("GridComponent afterUpdate for girdBox " + gridBox.element.piLanguageConcept())
        $cells = gridBox.cells;
        // Triggers autorun
        notifier.notifyChange();
    });
    let cells: Writable<GridCellBox[]> = writable<GridCellBox[]>(gridBox.cells);
    let templateColumns: string;
    let templateRows: string;

    let cssClass: string = "";
    // TODO either use svelte store for cells or mobx observable???
    // autorun(() => {
    //     $cells = [...gridBox.cells];
    //     length = $cells.length;
    //
    //     templateRows = `repeat(${gridBox.numberOfRows() - 1}, auto)`;
    //     templateColumns = `repeat(${gridBox.numberOfColumns() - 1}, auto)`;
    //     cssClass = gridBox.cssClass;
    // });
</script>

<div
        style:grid-template-columns="{templateColumns}"
        style:grid-template-rows="{templateRows}"
        class="maingridcomponent {cssClass}"
        id="{id}"
>
    {#each $cells as cell (cell.box.element.piId() + "-" + cell.box.id + cell.role + "-grid" + "-" + notifier.dummy)}
        <GridCellComponent grid={gridBox} cellBox={cell} editor={editor}/>
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
