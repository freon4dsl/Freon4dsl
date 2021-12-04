<script lang="ts">
    import { conceptStyle, PiLogger, styleToCSS } from "@projectit/core";
    import type { GridCell, PiEditor } from "@projectit/core";
    import { autorun } from "mobx";
    import { afterUpdate } from "svelte";
    import { AUTO_LOGGER, ChangeNotifier, UPDATE_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    import { isOdd } from "./util";

    // properties
    export let cell: GridCell;
    export let editor: PiEditor;

    //local variable
    const LOGGER = new PiLogger("GridCellComponent");
    let cssVariables: string;
    let notifier = new ChangeNotifier();
    afterUpdate(() => {
        UPDATE_LOGGER.log("GridCellComponent.afterUpdate")
        // Triggers autorun
        notifier.notifyChange();
    });

    const onCellClick = ( () => {
        LOGGER.log("GridCellComponent.onCellClick " + cell.row + ", "+ cell.column);
    });

    let row: string;
    let column: string;
    let boxStyle: string = "";
    autorun(() => {
        AUTO_LOGGER.log("GridCellComponent["+ notifier.dummy + "] ");
        row = cell.row + (cell.rowSpan ? " / span " + cell.rowSpan : "");
        column = cell.column + (cell.columnSpan ? " / span " + cell.columnSpan : "");
        const gridStyle = `grid-row: ${row}; grid-column: ${column};`;

        boxStyle = styleToCSS(conceptStyle(editor.style, editor.theme, cell.box.element.piLanguageConcept(), (isOdd(cell.row) ? "gridcellOdd" : "gridcellEven"), cell.style)) + gridStyle;
    });

</script>

<div
        id={"-c:" + cell.column + "-r:" + cell.row}
        class="gridcellcomponent"
        style={boxStyle}
        onClick={this.onCellClick}
>
    <RenderComponent box={cell.box} editor={editor}/>
</div>

<style>
    .gridcellcomponent {
        box-sizing: content-box;
        align-self: stretch;
        display: flex;
    }
</style>
