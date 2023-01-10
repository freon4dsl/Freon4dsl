<script lang="ts">
    /**
     * This component shows an empty line in the projection.
     */
    import type { EmptyLineBox } from "@projectit/core";
    import { componentId } from "./svelte-utils";

    export let box: EmptyLineBox;
    let id: string = !!box ? componentId(box) : 'emptyline-for-unknown-box';
</script>

<span id="{id}" >
    <br>
</span>

