<script lang="ts">

    import { onMount } from "svelte";
    import { MockVariables } from "./MockVariables";
    import { SelectOption } from "@projectit/core";

    onMount( () => {
        MockVariables.reset();
    });

    const onKeyDown = (event: KeyboardEvent) => {
        MockVariables.keydown(event);
    }

    const onKeyPress = (event: KeyboardEvent) => {
        MockVariables.keypress(event);
    }

    const onKeyUp = (event: KeyboardEvent) => {
        MockVariables.keyup(event);
    }

    const onPiItemSelected = (event: CustomEvent<SelectOption>) => {
        console.log("MockSurroundingComponent received option " + JSON.stringify(event.detail));
        MockVariables.pi_itemSelected(event);
    };

</script>

<div id="mockComponent"
     on:keypress={onKeyPress}
     on:keydown={onKeyDown}
     on:keyup={onKeyUp}
     on:piItemSelected={onPiItemSelected}
>
    <slot  />
</div>
