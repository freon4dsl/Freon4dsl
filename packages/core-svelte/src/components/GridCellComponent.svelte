<script lang="ts">
    import {
        GridBox,
        isMetaKey,
        ENTER,
        type PiEditor,
        PiLogger,
        toPiKey,
        GridCellBox,
        PiCommand,
        PI_NULL_COMMAND,
        PiPostAction, PiEditorUtil, Box
    } from "@projectit/core";
    import { autorun } from "mobx";
    import RenderComponent from "./RenderComponent.svelte";
    import { executeCustomKeyboardShortCut, isOdd } from "./svelte-utils";
    import { writable, Writable } from "svelte/store";

    // properties
    export let grid: GridBox;
    export let box: GridCellBox;
    export let editor: PiEditor;

    type BoxTypeName = "gridcellNeutral" | "gridcellOdd" | "gridcellEven";

    //local variable
    const LOGGER = new PiLogger("GridCellComponent").mute();
    let boxStore: Writable<Box> = writable<Box>(box.content); // todo see if we can do without this store
    let cssVariables: string;
    let id: string = box.id;

    const onKeydown = (event: KeyboardEvent) => {
        LOGGER.log("GridCellComponent onKeyDown");
        const piKey = toPiKey(event);
        if (isMetaKey(event) || event.key === ENTER) {
            LOGGER.log("Keyboard shortcut in GridCell ===============");
            // todo adjust the index, so that we know where to execute the command
            const index = 0;
            executeCustomKeyboardShortCut(event, index, box, editor);
        }
    };

    const onCellClick = (() => {
        // todo remove this or implement...
        LOGGER.log("GridCellComponent.onCellClick " + box.row + ", " + box.column);
    });

    let row: string;
    let column: string;
    let int: number = 0;
    let orientation: BoxTypeName = "gridcellNeutral";
    let isHeader = "noheader";
    let cssStyle: string = "";
    let cssClass: string = "";

    autorun(() => {
        $boxStore = box.content;
        LOGGER.log("GridCellComponent row/col " + box.$id + ": " + box.row + "," + box.column + "  span " + box.rowSpan + "," + box.columnSpan + "  box " + box.content.role + "--- " + int++);
        row = box.row + (box.rowSpan ? " / span " + box.rowSpan : "");
        column = box.column + (box.columnSpan ? " / span " + box.columnSpan : "");
        orientation = (grid.orientation === "neutral" ? "gridcellNeutral" : (grid.orientation === "row" ? (isOdd(box.row) ? "gridcellOdd" : "gridcellEven") : (isOdd(box.column) ? "gridcellOdd" : "gridcellEven")));
        if (box.isHeader) {
            isHeader = "gridcell-header";
        }
        cssStyle = $boxStore.cssStyle;
        cssClass = box.cssClass;
    });

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
