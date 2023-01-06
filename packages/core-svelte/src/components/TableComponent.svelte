<svelte:options immutable={true}/>
<script lang="ts">
    /**
     * This component shows a list of elements that have the same type (a 'true' list) as
     * a table. It can be shown row-based or column-based, both are displayed as a grid.
     * This component functions as a drop zone for dragged elements from either a ListComponent
     * or a TableCellComponent.
     */
    import {
        type TableBox,
        type PiEditor,
        PiLogger,
        Box,
        ListElementInfo,
        TableDirection, GridCellBox, isTableRowBox, isElementBox, TableCellBox
    } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { activeElem, activeIn, draggedElem, draggedFrom } from "./svelte-utils/DropAndSelectStore";
    import { dropListElement, moveListElement } from "@projectit/core";
    import TableCellComponent from "./TableCellComponent.svelte";

    const LOGGER = new PiLogger("TableComponent");

    export let box: TableBox;
    export let editor: PiEditor;

    let id = box?.id;
    let cells: GridCellBox[];
    let templateColumns: string;
    let templateRows: string;
    let cssClass: string;
    let gridElement: HTMLElement;
    let elementType: string;

    const refresh = (why?: string): void => {
        LOGGER.log("Refresh TableBox, box: " + why);
        if (!!box) {
            cells = getCells();
            templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
            templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
            cssClass = box.cssClass;
            elementType = box.conceptName;
        }
    };

    function getCells(): TableCellBox[] {
        const _cells: TableCellBox[] = []
        box.children.forEach(ch => {
            if (isElementBox(ch)) {
                const rowBox = ch.content;
                if (isTableRowBox(rowBox)) {
                    _cells.push(...rowBox.cells)
                }
            } else if (isTableRowBox(ch)) {
                _cells.push(...ch.cells);
            }
        })
        return _cells;
    }

    onMount( () => {
        box.refreshComponent = refresh;
        // We also set the refresh to each child that is a TableRowBox,
        // because TableRowBoxes do not have an equivalent Svelte component.
        for (const child of box.children) {
            if (isTableRowBox(child)) {
                child.refreshComponent = refresh;
            } else if (isElementBox(child) && isTableRowBox(child.content)){
                child.refreshComponent = refresh;
            }
        }
    });

    afterUpdate( () => {
        box.refreshComponent = refresh;
        for (const child of box.children) {
            if (isTableRowBox(child)) {
                child.refreshComponent = refresh;
            } else if (isElementBox(child) && isTableRowBox(child.content)){
                child.content.refreshComponent = refresh;
            }
        }
    });

    $: { // Evaluated and re-evaluated when the box changes.
        refresh("Refresh new box: " + box?.id);
    }
    // determine the type of the elements in the list
    // this speeds up the check whether the element may be dropped in a certain drop-zone

    const drop = (event: CustomEvent) => {
        const data: ListElementInfo = $draggedElem;
        let targetIndex = event.detail.row - 1;
        if (box.direction === TableDirection.VERTICAL) {
            targetIndex = event.detail.column - 1;
        }

        // console.log("DROPPING item [" + data.element.piId() + "] from [" + data.componentId + "] in grid [" + id + "] on position [" + targetIndex + "]");
        if (box.hasHeaders) { // take headers into account for the target index
            targetIndex = targetIndex - 1;
            // console.log("grid has headers, targetIndex: " + targetIndex);
        }
        if (data.componentId === id) { // dropping in the same grid
            // console.log("moving item within grid");
            moveListElement(box.element, data.element, box.propertyName, targetIndex);
        } else { // dropping in another list
            // console.log("moving item to another grid, drop type: " + data.elementType + ", grid cell type: " + elementType);
            dropListElement(editor, data, elementType, box.element, box.propertyName, targetIndex);
        }
        // Everything is done, so reset the variables
        $draggedElem = null;
        $draggedFrom = '';
        $activeElem = {row: - 1, column: -1 };
        $activeIn = '';
        // Clear the drag data cache (for all formats/types) (gives error in FireFox!)
        // event.dataTransfer.clearData();
    };
</script>

<span
        style:grid-template-columns="{templateColumns}"
        style:grid-template-rows="{templateRows}"
        class="maingridcomponent {cssClass}"
        id="{id}"
>
    {#each cells as cell (cell.content.elementId + '-' + cell.row + '-' + cell.column)}
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
