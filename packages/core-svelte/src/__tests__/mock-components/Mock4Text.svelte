<script lang="ts">
    import TextComponent from "../../components/TextComponent.svelte";
    import { PiEditor, TextBox } from "@projectit/core";

    export let box: TextBox;
    export let editor: PiEditor;
    export let id: string = "mock-text";
</script>


<div id="{id}">
        <TextComponent textBox={box} editor={editor} partOfActionBox={false} isEditing={false} text=""/>
</div>
