<script lang="ts">
    /**
     * This component shows an empty line in the projection.
     */
    import type { EmptyLineBox } from "@projectit/core";

    export let box: EmptyLineBox;
    let id: string = box.id;
</script>

<span id="{id}" >
    <br>
</span>

