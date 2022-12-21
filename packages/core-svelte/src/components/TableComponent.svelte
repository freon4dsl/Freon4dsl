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
        PiLogger,
        Box,
        isElementBox,
        isTableRowBox, ListElementInfo, TableDirection
    } from "@projectit/core";
    import ElementComponent from "./ElementComponent.svelte";
    import { afterUpdate, onMount } from "svelte";
    import TableRowComponent from "./TableRowComponent.svelte";
    import { activeElem, activeIn, draggedElem, draggedFrom } from "./svelte-utils/DropAndSelectStore";
    import { dropListElement, moveListElement } from "@projectit/core";

    const LOGGER = new PiLogger("TableComponent");

    export let box: TableBox;
    export let editor: PiEditor;

    let id = box?.id;
    let children: Box[];
    let templateColumns: string;
    let templateRows: string;
    let cssClass: string;
    let gridElement: HTMLElement;

    const refresh = (why?: string): void => {
        console.log("Refresh TableBox, box: " + why);
        if (!!box) {
            children = box.children;
            templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
            templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
            cssClass = box.cssClass;
        }
    } ;
    onMount( () => {
        box.refreshComponent = refresh;
    })
    afterUpdate( () => {
        box.refreshComponent = refresh;
    });

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.id);
    }
    // determine the type of the elements in the list
    // this speeds up the check whether the element may be dropped in a certain drop-zone
    let myMetaType: string;
    $: myMetaType = box.conceptName;

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
            dropListElement(editor, data, myMetaType, box.element, box.propertyName, targetIndex);
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
    {#each children as child}
        {#if (isElementBox(child))}
            <ElementComponent box={child} editor={editor}/>
        {:else if isTableRowBox(child)}
            <TableRowComponent box={child} editor={editor}/>
        {/if}
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
