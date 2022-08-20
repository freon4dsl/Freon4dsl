<script lang="ts">
    import SelectableComponent from "../../components/SelectableComponent.svelte";
    import TextComponent from "../../components/TextComponent.svelte";
    import { PiEditor, TextBox } from "@projectit/core";

    export let box: TextBox;
    export let editor: PiEditor;
    export let id: string = "mock-text";
</script>


<div id="{id}">
    <SelectableComponent box={box} editor={editor}>
        <TextComponent textBox={box} editor={editor} partOfAlias={false}/>
    </SelectableComponent>
</div>
