<script lang="ts">
    import { autorun } from "mobx";
    import { FOCUS_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    import type {IndentBox, PiEditor} from "@projectit/core";

    export let indentBox: IndentBox;
    export let editor: PiEditor;

    // style={{"marginLeft": indentBox.indent * 8 + "px" }}

    autorun( () => {
       indentBox.indent;
    });

    const onFocus = (e: FocusEvent) =>  {
        FOCUS_LOGGER.log("IndentComponent.onFocus")
    };
    const onBlur = (e: FocusEvent) => {
        FOCUS_LOGGER.log("IndentComponent.onBlur")
    }

</script>

<div
    class="indentStyle"
    tabIndex={0}
    on:focus={onFocus}
    on:blur={onBlur}
>
    <RenderComponent box={indentBox.child} editor={editor}/>
</div>

<style>
    .indentStyle {
        margin-left: 50px;
    }
</style>

