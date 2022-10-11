<script lang="ts">
    import TextComponent from "../../components/TextComponent.svelte";
    import { PiEditor, TextBox } from "@projectit/core";

    export let box1: TextBox;
    export let box2: TextBox;
    export let editor: PiEditor;
    export let id1: string = "mock-text1";
    export let id2: string = "mock-text2";
</script>


<div id="{id1}">
        <TextComponent textBox={box1} editor={editor} partOfActionBox={false} isEditing={false} text=""/>
</div>
<div id="{id2}">
        <TextComponent textBox={box2} editor={editor} partOfActionBox={false} isEditing={false} text=""/>
</div>
