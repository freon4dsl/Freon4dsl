<script lang="ts">
    import type { EmptyLineBox } from "@projectit/core";
    import { componentId } from "./svelte-utils";

    export let box: EmptyLineBox;
    let id: string = componentId(box);
</script>

<span id="{id}" >
    <br>
</span>

