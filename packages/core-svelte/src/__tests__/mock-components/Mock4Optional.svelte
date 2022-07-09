<script lang="ts">
    import MockSurroundingComponent from "./MockSurroundingComponent.svelte";
    import OptionalComponent from "../../components/OptionalComponent.svelte";
    import { OptionalBox, PiEditor } from "@projectit/core";

    // Parameters
    export let box: OptionalBox;
    export let editor: PiEditor;
    export let id = "mock-environment";

    const onKeyDown = (event: KeyboardEvent) => {
        console.log("onKeyDown: " + event.key + " ctrl: " + event.ctrlKey + " alt: " + event.altKey);
    }

    const onKeyPress = (event: KeyboardEvent) => {
        console.log("onKeyPress: " + event.key + " ctrl: " + event.ctrlKey + " alt: " + event.altKey);
    }
</script>

<div      on:keypress={onKeyPress}
          on:keydown={onKeyDown}
id="mock-environment">
    <MockSurroundingComponent>
        <OptionalComponent optionalBox={box} editor={editor}/>
    </MockSurroundingComponent>
</div>
