<script lang="ts">
    /**
     * This component shows an empty line in the projection.
     */
    import type { EmptyLineBox } from "@freon4dsl/core";
    import { componentId } from "./svelte-utils/index.js";

    export let box: EmptyLineBox;
    let id: string = !!box ? componentId(box) : 'emptyline-for-unknown-box';
</script>

<span id="{id}" >
    <br>
</span>

