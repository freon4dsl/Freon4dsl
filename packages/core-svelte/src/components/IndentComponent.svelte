<script lang="ts">
    /**
     * This component indents the child of its (Indent)Box.
     * Every indent is 8px wide.
     */
    import RenderComponent from "./RenderComponent.svelte";
    import type {IndentBox, PiEditor} from "@projectit/core";

    export let box: IndentBox;
    export let editor: PiEditor;

    const style=`margin-left: ${box.indent * 8}px;`;
    let id: string = box.id;

    // todo use autorun here ?
    // autorun( () => {
    //   box.indent;
    // });

</script>

<span
    style="{style}"
    id="{id}"
>
    <RenderComponent box={box.child} editor={editor}/>
</span>


