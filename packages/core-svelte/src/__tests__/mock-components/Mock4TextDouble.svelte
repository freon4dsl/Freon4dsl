<script lang="ts">
    import SelectableComponent from "../../components/SelectableComponent.svelte";
    import TextComponent from "../../components/TextComponent.svelte";
    import { PiEditor, TextBox } from "@projectit/core";

    export let box1: TextBox;
    export let box2: TextBox;
    export let editor: PiEditor;
    export let id1: string = "mock-text1";
    export let id2: string = "mock-text2";
</script>


<div id="{id1}">
    <SelectableComponent box={box1} editor={editor}>
        <TextComponent textBox={box1} editor={editor} partOfAlias={false}/>
    </SelectableComponent>
</div>
<div id="{id2}">
    <SelectableComponent box={box2} editor={editor}>
        <TextComponent textBox={box2} editor={editor} partOfAlias={false}/>
    </SelectableComponent>
</div>
