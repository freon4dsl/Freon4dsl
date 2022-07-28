<script lang="ts">
    import GridComponent from "../../components/GridComponent.svelte";
    import { GridBox, PiEditor } from "@projectit/core";

    export let grid: GridBox;
    export let editor: PiEditor;

    const id = "mock-grid-component";
</script>

<div id="{id}">
    <GridComponent gridBox={grid} editor={editor}/>
</div>
