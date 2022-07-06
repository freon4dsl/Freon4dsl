<script lang="ts">
    import { EmptyLineBox, type PiEditor } from "@projectit/core";

    export let box: EmptyLineBox;
    export let editor: PiEditor;
    let id: string = `${box.element.piId()}-${box.role}`;
</script>

<span id="{id}">
    <br>
</span>
