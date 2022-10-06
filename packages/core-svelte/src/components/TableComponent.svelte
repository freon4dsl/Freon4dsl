<script lang="ts">
    import { GridCellBox, type GridBox, type PiEditor, PiLogger, Language } from "@projectit/core";
    import { runInAction } from "mobx";
    import TableCellComponent from "./TableCellComponent.svelte";
    import { activeElem, activeIn, draggedElem, draggedFrom, ListElementInfo } from "./svelte-utils/DropAndSelectStore";
    import { dropListElement, moveListElement } from "./svelte-utils/dropHelpers";

    const LOGGER = new PiLogger("TableComponent"); //.mute();

    export let box: GridBox;
    export let editor: PiEditor;

    let id = box.id;
    // the following variables use svelte reactivity, when this does not suffice they should be set in a Mobx autorun method
    let cells: GridCellBox[];
    $: cells = box.cells;
    let templateColumns: string;
    $: templateColumns = `repeat(${box.numberOfColumns() - 1}, auto)`;
    let templateRows: string;
    $: templateRows = `repeat(${box.numberOfRows() - 1}, auto)`;
    let cssClass: string;
    $: cssClass = box.cssClass;
    let gridElement: HTMLElement;
    let elementType: string;
    // todo see how we can avoid the use of Language here
    $: elementType = Language.getInstance().classifierProperty(box.element.piLanguageConcept(), box.propertyName).type;

    const drop = (event: CustomEvent) => {
        const data: ListElementInfo = $draggedElem;
        let targetIndex = event.detail.row - 1;
        if (box.orientation === 'column') {
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
            if (data.elementType === elementType) { // check if item may be dropped here // TODO extend to include subtypes
                dropListElement(data, box.element, box.propertyName, targetIndex);
            } else {
                // TODO other way for error message
                alert("drop is not allowed here, types do not match [" + data.elementType + " != " + elementType + "]");
            }
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
    {#each cells as cell (cell.content.element.piId() + '-' + cell.row + '-' + cell.column)}
        <TableCellComponent
                parentComponentId={id}
                parentOrientation={box.orientation}
                elementType={elementType}
                box={cell}
                editor={editor}
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
        border-style: var(--freon-grid-component-border-style, solid);
        border-radius: 4px;
    }
</style>
