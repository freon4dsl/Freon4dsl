<script lang="ts">
    import LabelComponent from "../../components/LabelComponent.svelte";
    import { LabelBox, PiEditor } from "@projectit/core";
    // Parameters
    export let box1: LabelBox;
    export let box2: LabelBox;
    export let editor: PiEditor;

</script>

<div data-testid="test-label1">
    <LabelComponent label={box1} editor={editor}/>
</div>
<div data-testid="test-label2">
        <LabelComponent label={box2} editor={editor}/>
</div>

