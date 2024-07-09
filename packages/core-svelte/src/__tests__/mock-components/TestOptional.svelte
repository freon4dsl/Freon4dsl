<script lang="ts">
    import MockSurroundingComponent from "./MockSurroundingComponent.svelte";
    import OptionalComponent from "../../lib/components/OptionalComponent.svelte";
    import { OptionalBox, FreEditor } from "@freon4dsl/core";

    // Parameters
    export let box: OptionalBox;
    export let editor: FreEditor;
    export const id = "mock-environment";

    const onKeyDown = (event: KeyboardEvent) => {
        console.log("onKeyDown: " + event.key + " ctrl: " + event.ctrlKey + " alt: " + event.altKey);
    }

    const onKeyPress = (event: KeyboardEvent) => {
        console.log("onKeyPress: " + event.key + " ctrl: " + event.ctrlKey + " alt: " + event.altKey);
    }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions Ignored because everything is in the test environment -->
<div      on:keypress={onKeyPress}
          on:keydown={onKeyDown}
id="mock-environment" role="group">
    <MockSurroundingComponent>
        <OptionalComponent box={box} editor={editor}/>
    </MockSurroundingComponent>
</div>
