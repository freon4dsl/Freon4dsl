<script lang="ts">
    import {
        GridCellBox, isMetaKey, KEY_ENTER, PiUtils, toPiKey,
        type GridBox, type PiEditor, PiCommand, PI_NULL_COMMAND, PiPostAction
    } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { ChangeNotifier, MOUNT_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import GridCellComponent from "./GridCellComponent.svelte";
    import { autorun, runInAction } from "mobx";
    import { writable, type Writable } from "svelte/store";

    export let gridBox: GridBox;
    export let editor: PiEditor;

    let notifier = new ChangeNotifier();
    let id: string = `${gridBox.element.piId()}-${gridBox.role}`;

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

    const onKeydown = (event: KeyboardEvent) => {
        // TODO check whether this is needed, the gridcellcomponent handles this
        const piKey = toPiKey(event);
        if (isMetaKey(event) || event.key === KEY_ENTER) {
            const cmd: PiCommand = PiUtils.findKeyboardShortcutCommand(toPiKey(event), gridBox, editor);
            if( cmd !== PI_NULL_COMMAND) {
                let postAction: PiPostAction;
                runInAction( () => {
                    postAction = cmd.execute(gridBox, toPiKey(event), editor);
                });
                if(!!postAction) { postAction(); }
            } // TODO see if the following else can be removed
            else {
                // if (!isKeyboardShortcutForThis) {
                    if (event.key === KEY_ENTER) {
                        return;
                    }

                // }
            }
        }

    };
    let cssClass: string = "";
    // TODO either use svelte store for cells or mobx observable???
    autorun(() => {
        $cells = [...gridBox.cells];
        length = $cells.length;

        templateRows = `repeat(${gridBox.numberOfRows() - 1}, auto)`;
        templateColumns = `repeat(${gridBox.numberOfColumns() - 1}, auto)`;
        cssClass = gridBox.cssClass;
    });
</script>

<div
        style:grid-template-columns="{templateColumns}"
        style:grid-template-rows="{templateRows}"
        class="maingridcomponent {cssClass}"
        on:keydown={onKeydown}
        id="{id}"
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
        border-color: var(--freon-grid-component-border-color, darkgreen);
        border-width: var(--freon-grid-component-border-width, 1pt);
        border-style: var(--freon-grid-component-border-style, solid);
    }
</style>
