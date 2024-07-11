<script lang="ts">
    import LabelComponent from "../../lib/components/LabelComponent.svelte";
    import { LabelBox } from "@freon4dsl/core";
    // Parameters
    export let box1: LabelBox;
    export let box2: LabelBox;

</script>

<div data-testid="test-label1">
    <LabelComponent box={box1}/>
</div>
<div data-testid="test-label2">
        <LabelComponent box={box2}/>
</div>

