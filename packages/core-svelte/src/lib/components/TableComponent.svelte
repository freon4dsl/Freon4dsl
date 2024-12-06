<svelte:options immutable={true}/>
<script lang="ts">
    import { TABLE_LOGGER } from "$lib/components/ComponentLoggers.js";

    /**
     * This component shows a list of elements that have the same type (a 'true' list) as
     * a table. It can be shown row-based or column-based, both are displayed as a grid.
     * This component functions as a drop zone for dragged elements from either a ListComponent
     * or a TableCellComponent.
     */
    import {
        type TableBox,
        type FreEditor,
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

    const LOGGER = TABLE_LOGGER

    export let box: TableBox;
    export let editor: FreEditor;

    let id = !!box ? componentId(box) : 'table-for-unknown-box';
    let cells: TableCellBox[];
    let templateColumns: string;
    let templateRows: string;
    let cssClass: string;
    let htmlElement: HTMLElement;
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

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        htmlElement.focus();
    }

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
        });
        // console.log("all cell ids: ")
        // console.log(_cells.map(cell => `   ${cell.content.id + '-' + cell.row + '-' + cell.column}`).join("\n"));

        return _cells;
    }

    onMount( () => {
        box.refreshComponent = refresh;
        box.setFocus = setFocus;
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
        box.setFocus = setFocus;
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

        // console.log("DROPPING item [" + data.element.freId() + "] from [" + data.componentId + "] in grid [" + id + "] on position [" + targetIndex + "]");
        if (box.hasHeaders) { // take headers into account for the target index
            targetIndex = targetIndex - 1;
            // console.log("grid has headers, targetIndex: " + targetIndex);
        }
        if (data.componentId === id) { // dropping in the same grid
            // console.log("moving item within grid");
            moveListElement(box.node, data.element, box.propertyName, targetIndex);
        } else { // dropping in another list
            // console.log("moving item to another grid, drop type: " + data.elementType + ", grid cell type: " + elementType);
            dropListElement(editor, data, elementType, box.node, box.propertyName, targetIndex);
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
        class="table-component {cssClass}"
        id="{id}"
        tabIndex={-1}
        bind:this={htmlElement}
>
    {#each cells as cell (cell.content.id + '-' + cell.row + '-' + cell.column)}
        <TableCellComponent
                box={cell}
                editor={editor}
                parentComponentId={id}
                parentOrientation={box.direction}
                myMetaType={elementType}
                on:dropOnCell={drop}/>
    {/each}
</span>

