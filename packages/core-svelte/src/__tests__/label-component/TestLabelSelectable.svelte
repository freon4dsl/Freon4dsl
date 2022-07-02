<script lang="ts">
    import LabelComponent from "../../components/LabelComponent.svelte";
    import SelectableComponent from "../../components/SelectableComponent.svelte";
    import { Box, PiEditor } from "@projectit/core";
    // Parameters
    export let box1: Box;
    export let box2: Box;
    export let editor: PiEditor;

</script>

<div data-testid="test-label1">
<SelectableComponent box={box1} editor={editor} >
    <LabelComponent label={box1} editor={editor}/>
</SelectableComponent>
</div>
<div data-testid="test-label2">
    <SelectableComponent box={box2} editor={editor} >
        <LabelComponent label={box2} editor={editor}/>
    </SelectableComponent>
</div>

