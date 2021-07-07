<script lang="ts">
    import { autorun } from "mobx";
    import RenderComponent from "./RenderComponent.svelte";
    import type {IndentBox, PiEditor} from "@projectit/core";

    export let indentBox: IndentBox;
    export let editor: PiEditor;

    // style={{"marginLeft": indentBox.indent * 8 + "px" }}

    autorun( () => {
       indentBox.indent;
    });
</script>

<div class="indentStyle"  tabIndex={0}>
    <RenderComponent box={indentBox.child} editor={editor}/>
</div>

<style>
    .indentStyle {
        margin-left: 50px;
    }
</style>

