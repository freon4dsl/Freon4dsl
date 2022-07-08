<script lang="ts">

    import { onMount } from "svelte";
    import { MockVariables } from "./MockVariables";

    onMount( () => {
        MockVariables.reset();
    });

    const onKeyDown = (event: KeyboardEvent) => {
        MockVariables.nrKeyDown++;
    }

    const onKeyPress = (event: KeyboardEvent) => {
        MockVariables.nrKeyPress++;
    }

</script>

<div id="mockComponent"
     on:keypress={onKeyPress}
     on:keydown={onKeyDown}
>
    <slot  />
</div>
