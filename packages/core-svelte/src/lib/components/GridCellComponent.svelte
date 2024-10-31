<script lang="ts">
    import { GRIDCELL_LOGGER } from "$lib/components/ComponentLoggers.js";
    import {
        GridBox,
        isMetaKey,
        ENTER,
        type FreEditor,
        FreLogger,
        GridCellBox,
        Box
    } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import { componentId, executeCustomKeyboardShortCut, isOdd } from "./svelte-utils/index.js";

    // properties
    export let grid: GridBox;
    export let cellBox: GridCellBox;
    export let editor: FreEditor;

    type BoxTypeName = "gridcellNeutral" | "gridcellOdd" | "gridcellEven";

    //local variables
    const LOGGER = GRIDCELL_LOGGER
    let contentBox: Box;
    let id: string = !!cellBox? componentId(cellBox) : 'gridcell-for-unknown-box';

    let row: string;
    let column: string;
    let int: number = 0;
    let orientation: BoxTypeName = "gridcellNeutral";
    let isHeader = "noheader";
    let cssStyle: string = "";
    let cssClass: string = "";
    let htmlElement: HTMLElement;

    function refresh(from? : string): void {
        if (!!cellBox) {
            LOGGER.log("REFRESH GridCellComponent " + (!!from ? " from " + from + " " : "") + cellBox?.node?.freLanguageConcept() + "-" + cellBox?.node?.freId());
            LOGGER.log("GridCellComponent row/col " + cellBox.$id + ": " + cellBox.row + "," + cellBox.column + "  span " + cellBox.rowSpan + "," + cellBox.columnSpan + "  box " + cellBox.content.role + "--- " + int++);
            contentBox = cellBox.content;
            row = cellBox.row + (cellBox.rowSpan ? " / span " + cellBox.rowSpan : "");
            column = cellBox.column + (cellBox.columnSpan ? " / span " + cellBox.columnSpan : "");
            orientation = (grid.orientation === "neutral" ? "gridcellNeutral" : (grid.orientation === "row" ? (isOdd(cellBox.row) ? "gridcellOdd" : "gridcellEven") : (isOdd(cellBox.column) ? "gridcellOdd" : "gridcellEven")));
            if (cellBox.isHeader) {
                isHeader = "gridcell-header";
            }
            cssStyle = contentBox.cssStyle;
            cssClass = cellBox.cssClass;
        }
    }

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. Note that because focus can be set,
     * the html needs to have its tabindex set, and its needs to be bound
     * to a variable.
     */
    async function setFocus(): Promise<void> {
        htmlElement.focus();
    }

    onMount( () => {
        cellBox.refreshComponent = refresh;
        cellBox.setFocus = setFocus;
    }) ;

    afterUpdate(() => {
        cellBox.refreshComponent = refresh;
        cellBox.setFocus = setFocus;
    });

    const onKeydown = (event: KeyboardEvent) => {
        // todo this does not work anymore because the key down is handled by the box inside the table cell, remove it?
        LOGGER.log("GridCellComponent onKeyDown");
        // const freKey = toFreKey(event);
        if (isMetaKey(event) || event.key === ENTER) {
            LOGGER.log("Keyboard shortcut in GridCell ===============");
            const index = cellBox.propertyIndex;
            executeCustomKeyboardShortCut(event, index, cellBox, editor);
        }
    };

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(cellBox?.id);
    }
</script>

<div
        class="grid-cell-component {orientation} {isHeader} {cssClass}"
        style:grid-row="{row}"
        style:grid-column="{column}"
        style="{cssStyle}"
        on:keydown={onKeydown}
        id="{id}"
        bind:this={htmlElement}
        role="gridcell"
>
    <RenderComponent box={contentBox} editor={editor}/>
</div>
