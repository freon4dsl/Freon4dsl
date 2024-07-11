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

<!-- svelte-ignore a11y-no-noninteractive-element-interactions Ignored because everything is in the test environment -->
<div id="mockComponent"
     on:keypress={onKeyPress}
     on:keydown={onKeyDown}
     role="group"
>
    <slot  />
</div>
