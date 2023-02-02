<script lang="ts">
    import LabelComponent from "../../components/LabelComponent.svelte";
    import { LabelBox, FreEditor } from "@projectit/core";
    // Parameters
    export let box1: LabelBox;
    export let box2: LabelBox;
    export let editor: FreEditor;

</script>

<div data-testid="test-label1">
    <LabelComponent box={box1}/>
</div>
<div data-testid="test-label2">
        <LabelComponent box={box2}/>
</div>

