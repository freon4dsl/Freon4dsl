<script lang="ts">
    import { conceptStyle, GridCellBox, isMetaKey, KEY_ENTER, PiUtils, styleToCSS, toPiKey } from "@projectit/core";
    import type { GridBox, PiEditor } from "@projectit/core";
    import { afterUpdate } from "svelte";
    import { AUTO_LOGGER, ChangeNotifier, UPDATE_LOGGER } from "./ChangeNotifier";
    import GridCellComponent from "./GridCellComponent.svelte";
    import { autorun } from "mobx";

    export let gridBox: GridBox;
    export let editor: PiEditor;

    let notifier = new ChangeNotifier();
    afterUpdate(() => {
        UPDATE_LOGGER.log("ListComponent.afterUpdate")
        // Triggers autorun
        notifier.notifyChange();
    });

    let cells: GridCellBox[];
    let templateColumns: string;
    let templateRows: string;
    let boxStyle = ""
    const onKeydown = (event: KeyboardEvent) => {
        const piKey = toPiKey(event);
        if (isMetaKey(event) || event.key === KEY_ENTER) {
            const isKeyboardShortcutForThis = PiUtils.handleKeyboardShortcut(piKey, gridBox, editor);
            if (!isKeyboardShortcutForThis) {
                if (event.key === KEY_ENTER) {
                    return;
                }

            }
        }

    };
    autorun(() => {
        AUTO_LOGGER.log("GridComponent[" + notifier.dummy + "] " + gridBox.role);
        cells = [...gridBox.cells];
        // cells.forEach(cell => {
        //     AUTO_LOGGER.log("    cell.role: " + cell.role + " box role " + cell.box.role + " id " + cell.box.id);
        // });
        templateRows = `repeat(${gridBox.numberOfRows() - 1}, auto)`;
        templateColumns = `repeat(${gridBox.numberOfColumns() - 1}, auto)`;
        boxStyle = styleToCSS(conceptStyle(editor.style, editor.theme, gridBox.element.piLanguageConcept(), "grid", gridBox.style));

    });
</script>
<div
        style=" grid-template-columns: {templateColumns};
                grid-template-rows: {templateRows};
                {boxStyle}
              "
        class="maingridcomponent"
        on:keydown={onKeydown}
>
    {#each cells as cell (cell.box.id + cell.role + "-grid")}
        <GridCellComponent grid={gridBox} cellBox={cell} editor={editor}/>
    {/each}
</div>

<style>
    .maingridcomponent {
        display: inline-grid;
        /*grid-gap: 2px;*/
        align-items: center;
        align-content: center;
        justify-items: stretch;
        border: darkgreen;
        border-width: 1pt;
        border-style: solid;
    }
</style>
