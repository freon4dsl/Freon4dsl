<script lang="ts">
    import { conceptStyle, GridCellBox, isMetaKey, KEY_ENTER, PiUtils, styleToCSS, toPiKey,
        type GridBox, type PiEditor } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { AUTO_LOGGER, ChangeNotifier, MOUNT_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import GridCellComponent from "./GridCellComponent.svelte";
    import { autorun } from "mobx";
    import { writable, type Writable } from "svelte/store";

    export let gridBox: GridBox;
    export let editor: PiEditor;

    let notifier = new ChangeNotifier();

    onMount( () => {
        MOUNT_LOGGER.log("GridComponent onmount")
        $cells = gridBox.cells;
    })

    afterUpdate(() => {
        UPDATE_LOGGER.log("GridComponent afterUpdate for girdBox " + gridBox.element.piLanguageConcept())
        $cells = gridBox.cells;
        // Triggers autorun
        notifier.notifyChange();
    });
    let cells: Writable<GridCellBox[]> = writable<GridCellBox[]>(gridBox.cells);
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
        $cells = [...gridBox.cells];
        length = $cells.length;

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
    {#each $cells as cell (cell.box.element.piId() + "-" + cell.box.id + cell.role + "-grid" + "-" + notifier.dummy)}
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
