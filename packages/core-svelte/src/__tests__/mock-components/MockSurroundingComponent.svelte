<script lang="ts">

    import { onMount } from "svelte";
    import { MockVariables } from "./MockVariables.js";

    onMount( () => {
        MockVariables.reset();
    });

    const onKeyDown = (event: KeyboardEvent) => {
        MockVariables.keydown(event);
    }

    const onKeyPress = (event: KeyboardEvent) => {
        MockVariables.keypress(event);
    }

</script>

<div id="mockComponent"
     on:keypress={onKeyPress}
     on:keydown={onKeyDown}
>
    <slot  />
</div>
