<script lang="ts">
    import TableCellComponent from "./TableCellComponent.svelte";
    import { onMount, afterUpdate } from "svelte";
    import {
        PiLogger,
        type PiEditor,
        TableRowBox,
        TableCellBox,
        TableDirection,
        isElementBox,
        PiUtils, isTableBox
    } from "@projectit/core";

    export let box: TableRowBox;
    export let editor: PiEditor;

    const LOGGER = new PiLogger("TableRowComponent");
    let id: string = `${box?.element?.piId()}-${box?.role}`;
    let cells: TableCellBox[] ;
    let hasHeaders: boolean;
    let direction: TableDirection;

    const refresh = (): void =>  {
        console.log("DIRTY TableRowBox for " + box?.element?.piLanguageConcept() + "-" + box?.element?.piId());
        if (!!box) {
            cells = box.cells;
            let parent = box.parent;
            if (isElementBox(parent)) {
                parent = parent.parent;
            }
            PiUtils.CHECK(isTableBox(parent));
            if (isTableBox(parent)) {
                hasHeaders = parent.hasHeaders;
                direction = parent.direction;
            }
        }
    }

    onMount( () => {
        box.refreshComponent = refresh;
        refresh();
    });

    afterUpdate( () => {
        box.refreshComponent = refresh;
        refresh();
    });

    refresh();

</script>

{#each cells as cell (cell.box.element.piId() + "-" + cell.row + "-" + cell.column)}
    <TableCellComponent
            parentComponentId={id}
            parentOrientation={direction}
            box={cell}
            editor={editor}
            parentHasHeader={hasHeaders}
    />
{/each}



<style>
</style>
