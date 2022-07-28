<script lang="ts">
    import GridComponent from "../../components/GridComponent.svelte";
    import { GridBox, PiEditor } from "@projectit/core";
    import MockSurroundingComponent from "./MockSurroundingComponent.svelte";

    export let grid: GridBox;
    export let editor: PiEditor;

    const id = "mock-grid-component";
</script>

<div id="{id}">
    <MockSurroundingComponent>
        <GridComponent gridBox={grid} editor={editor}/>
    </MockSurroundingComponent>
</div>
