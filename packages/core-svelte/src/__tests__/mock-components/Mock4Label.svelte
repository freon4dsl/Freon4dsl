<script lang="ts">
    import { LabelBox, PiEditor } from "@projectit/core";
    import MockSurroundingComponent from "./MockSurroundingComponent.svelte";
    import LabelComponent from "../../components/LabelComponent.svelte";

    // Parameters
    export let box: LabelBox;
    export let editor: PiEditor;
    export let id = "mock-environment";
</script>

<div id="mock-environment">
    <MockSurroundingComponent>
        <LabelComponent label={box} editor={editor}/>
    </MockSurroundingComponent>
</div>
