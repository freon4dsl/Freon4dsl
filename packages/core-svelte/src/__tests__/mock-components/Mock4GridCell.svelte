<script lang="ts">
    import GridCellComponent from "../../components/GridCellComponent.svelte";
    import { GridBox, GridCellBox, PiEditor } from "@projectit/core";

    export let grid: GridBox;
    export let cell: GridCellBox;
    export let editor: PiEditor;

    const id = "mock-grid-cell-component";
</script>

<div id="{id}">
    <GridCellComponent grid={grid} cellBox={cell} editor={editor}/>
</div>
