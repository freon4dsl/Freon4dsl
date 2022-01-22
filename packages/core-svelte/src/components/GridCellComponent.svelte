
<script lang="ts">
     import {
          conceptStyle,
          GridBox,
          isMetaKey,
          KEY_ENTER,
          PiLogger,
          PiUtils,
          styleToCSS,
          toPiKey,
          GridCellBox, Box
     } from "@projectit/core";
    import type { PiEditor } from "@projectit/core";
    import { autorun } from "mobx";
    import { afterUpdate } from "svelte";
    import { writable } from "svelte/store";
    import type { Writable } from "svelte/store";

    import { AUTO_LOGGER, ChangeNotifier, UPDATE_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    import { isOdd } from "./util";

    // properties
    export let grid: GridBox;
    export let cellBox: GridCellBox ;
    export let editor: PiEditor;

    //local variable
    const LOGGER = new PiLogger("GridCellComponent");
    let boxStore: Writable<Box> = writable<Box>(cellBox.box);
    let cssVariables: string;

    afterUpdate(() => {
        UPDATE_LOGGER.log("GridCellComponent.afterUpdate")
        // Triggers autorun
        $boxStore = cellBox.box
    });

    const onKeydown = (event: KeyboardEvent) => {
        console.log("GridCellComponent onKeyDown")
        const piKey = toPiKey(event);
        if (isMetaKey(event) || event.key === KEY_ENTER) {
            console.log("Keyboard shortcut in GridCell ===============")
            const isKeyboardShortcutForThis = PiUtils.handleKeyboardShortcut(piKey, cellBox, editor);
            if (!isKeyboardShortcutForThis) {
                LOGGER.log("Key not handled for element gridcell so propagate ");// + textBox.element);
                if (event.key === KEY_ENTER) {
                    LOGGER.log("   ENTER, so propagate");
                    return;
                }

            } else {
                event.stopPropagation();
            }
        }

    };

    const onCellClick = ( () => {
        LOGGER.log("GridCellComponent.onCellClick " + cellBox.row + ", "+ cellBox.column);
    });

    let row: string;
    let column: string;
    let boxStyle: string = "";
    let int: number = 0;
    autorun(() => {
        $boxStore = cellBox.box;
        console.log("GridCellComponent row/col " + cellBox.$id + ": " + cellBox.row + "," + cellBox.column + "  span " + cellBox.rowSpan + "," + cellBox.columnSpan + "  box " + cellBox.box.role + "--- " + int++);
        row = cellBox.row + (cellBox.rowSpan ? " / span " + cellBox.rowSpan : "");
        column = cellBox.column + (cellBox.columnSpan ? " / span " + cellBox.columnSpan : "");
        const gridStyle = `grid-row: ${row}; grid-column: ${column};`;
        const orientation = (grid.orientation === "neutral" ? "gridcellNeutral" : (grid.orientation === "row" ? (isOdd(cellBox.row) ? "gridcellOdd" : "gridcellEven") : (isOdd(cellBox.column) ?"gridcellOdd" : "gridcellEven" )));
        boxStyle = styleToCSS(conceptStyle(editor.style, editor.theme, cellBox.box.element.piLanguageConcept(), orientation, cellBox.style)) + gridStyle;
    });

</script>

<div
        class="gridcellcomponent"
        style={boxStyle}
        onClick={onCellClick}
        on:keydown={onKeydown}
>
     <RenderComponent box={$boxStore} editor={editor}/>
</div>

<style>
    .gridcellcomponent {
        box-sizing: content-box;
        align-self: stretch;
        display: flex;
        color: magenta
    }
</style>
