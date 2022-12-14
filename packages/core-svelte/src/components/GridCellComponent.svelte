<script lang="ts">
    import {
        GridBox,
        isMetaKey,
        ENTER,
        type PiEditor,
        PiLogger,
        toPiKey,
        GridCellBox, Box, PiCommand, PI_NULL_COMMAND, PiPostAction, PiEditorUtil
    } from "@projectit/core";
    import { runInAction } from "mobx";
    import { afterUpdate, onMount } from "svelte";
    import { writable, type Writable } from "svelte/store";
    import { UPDATE_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    import { componentId, isOdd } from "./util";

    // properties
    export let grid: GridBox;
    export let cellBox: GridCellBox;
    export let editor: PiEditor;

    type BoxTypeName = "gridcellNeutral" | "gridcellOdd" | "gridcellEven";

    //local variable
    const LOGGER = new PiLogger("GridCellComponent").mute();
    let boxStore: Writable<Box> = writable<Box>(cellBox.box);
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
        console.log("DIRTY GridCellComponent " + (!!from?" from " + from + " ": "") + cellBox?.element?.piLanguageConcept() + "-" + cellBox?.element?.piId());
        $boxStore = cellBox.box;
        LOGGER.log("GridCellComponent row/col " + cellBox.$id + ": " + cellBox.row + "," + cellBox.column + "  span " + cellBox.rowSpan + "," + cellBox.columnSpan + "  box " + cellBox.box.role + "--- " + int++);
        row = cellBox.row + (cellBox.rowSpan ? " / span " + cellBox.rowSpan : "");
        column = cellBox.column + (cellBox.columnSpan ? " / span " + cellBox.columnSpan : "");
        orientation = (grid.orientation === "neutral" ? "gridcellNeutral" : (grid.orientation === "row" ? (isOdd(cellBox.row) ? "gridcellOdd" : "gridcellEven") : (isOdd(cellBox.column) ? "gridcellOdd" : "gridcellEven")));
        if (cellBox.isHeader) {
            isHeader = "gridcell-header";
        }
        cssStyle = $boxStore.cssStyle;
        cssClass = cellBox.cssClass;
    }

    refresh("init component");

    onMount( () => {
        $boxStore = cellBox.box;
        cellBox.refreshComponent = refresh;
    }) ;

    afterUpdate(() => {
        UPDATE_LOGGER.log("GridCellComponent.afterUpdate");
        $boxStore = cellBox.box;
        cellBox.refreshComponent = refresh;
    });

    const onKeydown = (event: KeyboardEvent) => {
        LOGGER.log("GridCellComponent onKeyDown");
        const piKey = toPiKey(event);
        if (isMetaKey(event) || event.key === ENTER) {
            LOGGER.log("Keyboard shortcut in GridCell ===============");
            const cmd: PiCommand = PiEditorUtil.findKeyboardShortcutCommand(toPiKey(event), cellBox, editor);
            if (cmd !== PI_NULL_COMMAND) {
                let postAction: PiPostAction;
                runInAction(() => {
                    const action = event["action"];
                    if (!!action) {
                        action();
                    }
                    postAction = cmd.execute(cellBox, toPiKey(event), editor);
                });
                if (!!postAction) {
                    postAction();
                }
                event.stopPropagation();
            }
        }

    };

    const onCellClick = (() => {
        LOGGER.log("GridCellComponent.onCellClick " + cellBox.row + ", " + cellBox.column);
    });


    // autorun(() => {
        // $boxStore = cellBox.box;
        // LOGGER.log("GridCellComponent row/col " + cellBox.$id + ": " + cellBox.row + "," + cellBox.column + "  span " + cellBox.rowSpan + "," + cellBox.columnSpan + "  box " + cellBox.box.role + "--- " + int++);
        // row = cellBox.row + (cellBox.rowSpan ? " / span " + cellBox.rowSpan : "");
        // column = cellBox.column + (cellBox.columnSpan ? " / span " + cellBox.columnSpan : "");
        // orientation = (grid.orientation === "neutral" ? "gridcellNeutral" : (grid.orientation === "row" ? (isOdd(cellBox.row) ? "gridcellOdd" : "gridcellEven") : (isOdd(cellBox.column) ? "gridcellOdd" : "gridcellEven")));
        // if (cellBox.isHeader) {
        //     isHeader = "gridcell-header";
        // }
        // cssStyle = $boxStore.cssStyle;
        // cssClass = cellBox.cssClass;
    // });

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
