<script lang="ts">
    /**
     * This component shows a list of elements that have the same type (a 'true' list) as
     * a table. It can be shown row-based or column-based, both are displayed as a grid.
     * This component functions as a drop zone for dragged elements from either a ListComponent
     * or a TableCellComponent.
     */
    import {
        TableCellBox,
        type TableBox,
        type PiEditor,
        PiLogger
    } from "@projectit/core";
    import { runInAction } from "mobx";
    import TableCellComponent from "./TableCellComponent.svelte";
    // import { activeElem, activeIn, draggedElem, draggedFrom } from "./svelte-utils/DropAndSelectStore";
    // import { dropListElement, moveListElement } from "@projectit/core";

    const LOGGER = new PiLogger("TableComponent"); //.mute();

    export let box: TableBox;
    export let editor: PiEditor;

    let id = box.id;
    // the following variables use svelte reactivity, when this does not suffice they should be set in a Mobx autorun method
    let cells: TableCellBox[];
    $: cells = box.cells;
    let templateColumns: string;
    $: templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
    let templateRows: string;
    $: templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
    let cssClass: string;
    $: cssClass = box.cssClass;
    let gridElement: HTMLElement;
    // determine the type of the elements in the list
    // this speeds up the check whether the element may be dropped in a certain drop-zone
    // let myMetaType: string;
    // $: myMetaType = box.conceptName;

    // const drop = (event: CustomEvent) => {
    //     const data: ListElementInfo = $draggedElem;
    //     let targetIndex = event.detail.row - 1;
    //     if (box.orientation === 'column') {
    //         targetIndex = event.detail.column - 1;
    //     }
    //
    //     // console.log("DROPPING item [" + data.element.piId() + "] from [" + data.componentId + "] in grid [" + id + "] on position [" + targetIndex + "]");
    //     if (box.hasHeaders) { // take headers into account for the target index
    //         targetIndex = targetIndex - 1;
    //         // console.log("grid has headers, targetIndex: " + targetIndex);
    //     }
    //     if (data.componentId === id) { // dropping in the same grid
    //         // console.log("moving item within grid");
    //         moveListElement(box.element, data.element, box.propertyName, targetIndex);
    //     } else { // dropping in another list
    //         // console.log("moving item to another grid, drop type: " + data.elementType + ", grid cell type: " + elementType);
    //         dropListElement(editor, data, myMetaType, box.element, box.propertyName, targetIndex);
    //     }
    //     // Everything is done, so reset the variables
    //     $draggedElem = null;
    //     $draggedFrom = '';
    //     $activeElem = {row: - 1, column: -1 };
    //     $activeIn = '';
    //     // Clear the drag data cache (for all formats/types) (gives error in FireFox!)
    //     // event.dataTransfer.clearData();
    // };
</script>

<span
        style:grid-template-columns="{templateColumns}"
        style:grid-template-rows="{templateRows}"
        class="maingridcomponent {cssClass}"
        id="{id}"
>
    {#each cells as cell (cell.box.element.piId() + '-' + cell.row + '-' + cell.column)}
        <TableCellComponent
                parentComponentId={id}
                parentOrientation={box.orientation}
                box={cell}
                editor={editor}
                parentHasHeader={box.hasHeaders}
        />
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
