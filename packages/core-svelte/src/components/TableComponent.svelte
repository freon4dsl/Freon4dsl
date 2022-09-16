<script lang="ts">
    import { GridCellBox, type GridBox, type PiEditor, PiLogger } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { autorun } from "mobx";
    import GridCellComponent from "./TableCellComponent.svelte";


    const LOGGER = new PiLogger("GridComponent").mute();

    export let box: GridBox;
    export let editor: PiEditor;

    let id = box.id;
    let cells: GridCellBox[];
    $: cells = box.cells;
    let templateColumns: string = `repeat(${box.numberOfColumns() - 1}, auto)`;
    let templateRows: string = `repeat(${box.numberOfRows() - 1}, auto)`;
    let cssClass: string = box.cssClass;

    // autorun(() => {
    //     $cells = [...box.cells];
    //     length = $cells.length;
    //
    //     templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
    //     templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
    //     cssClass = box.cssClass;
    // });
</script>

<span
        style:grid-template-columns="{templateColumns}"
        style:grid-template-rows="{templateRows}"
        class="maingridcomponent {cssClass}"
        id="{id}"
>
    {#each cells as cell (cell.content.element.piId() + '-' + cell.row + '-' + cell.column)}
        <GridCellComponent box={cell} editor={editor} parentId="{id}"/>
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
        border-style: var(--freon-grid-component-border-style, solid);
        border-radius: 4px;
    }
</style>
