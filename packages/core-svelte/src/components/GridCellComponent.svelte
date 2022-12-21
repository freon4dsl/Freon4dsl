<script lang="ts">
    import {
        GridBox,
        isMetaKey,
        ENTER,
        type PiEditor,
        PiLogger,
        toPiKey,
        GridCellBox,
        Box
    } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import RenderComponent from "./RenderComponent.svelte";
    import { componentId, isOdd } from "./util";
    import { executeCustomKeyboardShortCut, isOdd } from "./svelte-utils";

    // properties
    export let grid: GridBox;
    export let cellBox: GridCellBox;
    export let editor: PiEditor;

    type BoxTypeName = "gridcellNeutral" | "gridcellOdd" | "gridcellEven";

    //local variables
    const LOGGER = new PiLogger("GridCellComponent");
    let boxStore: Writable<Box> = writable<Box>(cellBox.content); // todo see if we can do without this store
    let cssVariables: string;
    let id: string = componentId(cellBox);

    let row: string;
    let column: string;
    let int: number = 0;
    let orientation: BoxTypeName = "gridcellNeutral";
    let isHeader = "noheader";
    let cssStyle: string = "";
    let cssClass: string = "";

    function refresh(from? : string): void {
        if (!!cellBox) {
            LOGGER.log("REFRESH GridCellComponent " + (!!from ? " from " + from + " " : "") + cellBox?.element?.piLanguageConcept() + "-" + cellBox?.element?.piId());
            $boxStore = cellBox.content;
            LOGGER.log("GridCellComponent row/col " + cellBox.$id + ": " + cellBox.row + "," + cellBox.column + "  span " + cellBox.rowSpan + "," + cellBox.columnSpan + "  box " + cellBox.content.role + "--- " + int++);
            row = cellBox.row + (cellBox.rowSpan ? " / span " + cellBox.rowSpan : "");
            column = cellBox.column + (cellBox.columnSpan ? " / span " + cellBox.columnSpan : "");
            orientation = (grid.orientation === "neutral" ? "gridcellNeutral" : (grid.orientation === "row" ? (isOdd(cellBox.row) ? "gridcellOdd" : "gridcellEven") : (isOdd(cellBox.column) ? "gridcellOdd" : "gridcellEven")));
            if (cellBox.isHeader) {
                isHeader = "gridcell-header";
            }
            cssStyle = $boxStore.cssStyle;
            cssClass = cellBox.cssClass;
            $boxStore = cellBox.content;
        }
    }

    onMount( () => {
        cellBox.refreshComponent = refresh;
    }) ;

    afterUpdate(() => {
        cellBox.refreshComponent = refresh;
    });

    const onKeydown = (event: KeyboardEvent) => {
        LOGGER.log("GridCellComponent onKeyDown");
        const piKey = toPiKey(event);
        if (isMetaKey(event) || event.key === ENTER) {
            LOGGER.log("Keyboard shortcut in GridCell ===============");
            // todo adjust the index, so that we know where to execute the command
            const index = 0;
            executeCustomKeyboardShortCut(event, index, cellBox, editor);
        }
    };

    const onCellClick = (() => {
        // todo remove this or implement...
        LOGGER.log("GridCellComponent.onCellClick " + cellBox.row + ", " + cellBox.column);
    });

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(cellBox?.id);
    }
</script>

<div
        class="gridcellcomponent {orientation} {isHeader} {cssClass}"
        style:grid-row="{row}"
        style:grid-column="{column}"
        style="{cssStyle}"
        onClick={onCellClick}
        on:keydown={onKeydown}
        id="{id}"
>
    <RenderComponent box={$boxStore} editor={editor}/>
</div>

<style>
    .gridcellcomponent {
        box-sizing: border-box;
        align-self: stretch;
        justify-self: var(--freon-gridcell-component-justify-left, stretch);
        display: flex;
        padding: var(--freon-gridcell-component-padding, 1px);
        padding: var(--freon-gridcell-component-margin, 1px);
        background-color: var(--freon-gridcell-component-background-color, white);
        color: var(--freon-gridcell-component-color, inherit);
    }
</style>
