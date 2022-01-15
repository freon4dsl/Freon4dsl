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
        GridCellBox
    } from "@projectit/core";
    import type { PiEditor } from "@projectit/core";
    import { gridcell } from "@projectit/playground/dist/example/editor/styles/CustomStyles";
    import { autorun } from "mobx";
    import { afterUpdate } from "svelte";
    import { AUTO_LOGGER, ChangeNotifier, UPDATE_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    // import { textBox } from "./TextComponent.svelte";
    import { isOdd } from "./util";

    // properties
    export let grid: GridBox;
    export let cellBox: GridCellBox ;
    export let editor: PiEditor;

    //local variable
    const LOGGER = new PiLogger("GridCellComponent");
    let cell = cellBox;
    let cssVariables: string;
    let notifier = new ChangeNotifier();
    afterUpdate(() => {
        UPDATE_LOGGER.log("GridCellComponent.afterUpdate")
        // Triggers autorun
        notifier.notifyChange();
    });

    const onKeydown = (event: KeyboardEvent) => {
        console.log("GridCellComponent onKeyDown")
        const piKey = toPiKey(event);
        if (isMetaKey(event) || event.key === KEY_ENTER) {
            console.log("Keyboard shortcut in GridCell ===============")
            const isKeyboardShortcutForThis = PiUtils.handleKeyboardShortcut(piKey, cell, editor);
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
        LOGGER.log("GridCellComponent.onCellClick " + cell.row + ", "+ cell.column);
    });

    let row: string;
    let column: string;
    let boxStyle: string = "";
    let int: number = 0;
    autorun(() => {
        cell = cellBox;
        AUTO_LOGGER.log("GridCellComponent row/col " + cell.$id + ": " + cell.row + "," + cell.column + "  span " + cell.rowSpan + "," + cell.columnSpan + "  box " + cell.box.role + "   --- " + int++);
        row = cell.row + (cell.rowSpan ? " / span " + cell.rowSpan : "");
        column = cell.column + (cell.columnSpan ? " / span " + cell.columnSpan : "");
        const gridStyle = `grid-row: ${row}; grid-column: ${column};`;
        const orientation = (grid.orientation === "neutral" ? "gridcellNeutral" : (grid.orientation === "row" ? (isOdd(cell.row) ? "gridcellOdd" : "gridcellEven") : (isOdd(cell.column) ?"gridcellOdd" : "gridcellEven" )));
        boxStyle = styleToCSS(conceptStyle(editor.style, editor.theme, cell.box.element.piLanguageConcept(), orientation, cell.style)) + gridStyle;
    });

</script>

<div
        class="gridcellcomponent"
        style={boxStyle}
        onClick={onCellClick}
        on:keydown={onKeydown}
>
     <RenderComponent box={cell.box} editor={editor}/>
</div>

<style>
    .gridcellcomponent {
        box-sizing: content-box;
        align-self: stretch;
        display: flex;
        color: magenta
    }
</style>
