<script lang="ts">
    import { autorun } from "mobx";
    import RenderComponent from "./RenderComponent.svelte";
    import type {IndentBox, PiEditor} from "@projectit/core";
    import { componentId } from "./svelte-utils";

    export let box: IndentBox;
    export let editor: PiEditor;

    const style=`margin-left: ${box.indent * 8}px;`;
    let id: string = componentId(box);

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


