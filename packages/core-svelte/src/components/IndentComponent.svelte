<script lang="ts">
    import { autorun } from "mobx";
    import { FOCUS_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    import type {IndentBox, PiEditor} from "@projectit/core";

    export let indentBox: IndentBox;
    export let editor: PiEditor;

    let style=`${indentBox.indent * 8}px;`;

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

<span
    class="indentStyle"
    tabIndex={0}
    style:margin-left="{style}"
    on:focus={onFocus}
    on:blur={onBlur}
>
    <RenderComponent box={indentBox.child} editor={editor}/>
</span>

<style>
    .indentStyle {
        margin-left: 50px;
    }
</style>

