<script lang="ts">
    import type { EmptyLineBox, PiEditor } from "@projectit/core";
    import { componentId } from "./util";

    export let box: EmptyLineBox;
    // export let editor: PiEditor;
    let id: string = componentId(box);
</script>

<span id="{id}">
    <br>
</span>
