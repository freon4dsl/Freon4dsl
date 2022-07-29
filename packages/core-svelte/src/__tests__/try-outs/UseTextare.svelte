<script lang="ts">
    import { PiEditor, TextBox } from "@projectit/core";
    import TextBasedOnTextarea from "./TextBasedOnTextarea.svelte";

    export let box1: TextBox;
    export let box2: TextBox;
    export let editor: PiEditor;
    export let id1: string = "mock-text1";
    export let id2: string = "mock-text2";
</script>


<div id="{id1}">
        <TextBasedOnTextarea textBox={box1} editor={editor}/>
</div>
<div id="{id2}">
        <TextBasedOnTextarea textBox={box2} editor={editor}/>
</div>
