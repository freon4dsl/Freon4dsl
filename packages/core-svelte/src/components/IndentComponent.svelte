<script lang="ts">
    import { autorun } from "mobx";
    import { FOCUS_LOGGER } from "./ChangeNotifier";
    import RenderComponent from "./RenderComponent.svelte";
    import type {IndentBox, PiEditor} from "@projectit/core";
    import { componentId } from "./util";

    export let indentBox: IndentBox;
    export let editor: PiEditor;

    // only exported for testing purposes
    export const style=`margin-left: ${indentBox.indent * 8}px;`;
    let id: string = componentId(indentBox);

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
    style="{style}"
    on:focus={onFocus}
    on:blur={onBlur}
    id="{id}"
>
    <RenderComponent box={indentBox.child} editor={editor}/>
</span>

<style>
    .indentStyle {
        /*margin-left: 50px;*/
    }
</style>

