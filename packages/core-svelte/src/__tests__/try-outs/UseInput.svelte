<script lang="ts">
    import { PiEditor, TextBox } from "@projectit/core";
    import TextBasedOnInput from "./TextBasedOnInput.svelte";

    export let box1: TextBox;
    export let box2: TextBox;
    export let editor: PiEditor;
    export let id1: string = "mock-text1";
    export let id2: string = "mock-text2";
</script>


<div id="{id1}">
    <TextBasedOnInput textBox={box1} editor={editor} value={box1.getText()}/>
</div>
<div id="{id2}">
    <TextBasedOnInput textBox={box2} editor={editor}/>
</div>
