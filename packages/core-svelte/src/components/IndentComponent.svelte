<script lang="ts">
    import { Box, PiLogger } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import type {IndentBox, PiEditor} from "@projectit/core";
    import { componentId } from "./util";

    export let box: IndentBox;
    export let editor: PiEditor;

    const LOGGER = new PiLogger("IndentComponent");

    // only exported for testing purposes
    let style;
    let id: string = componentId(box);
    let child: Box;

    onMount( () => {
        box.refreshComponent = refresh;
    });
    afterUpdate( () => {
        box.refreshComponent = refresh;
    })

    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH Indent for box " + box?.role + " child " + box?.child?.role);
        child = box?.child;
        style = `margin-left: ${box?.indent * 8}px;`
    };
    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
</script>

<span
    class="indentStyle"
    tabIndex={0}
    style="{style}"
    id="{id}"
>
    <RenderComponent box={child} editor={editor}/>
</span>

<style>
    .indentStyle {
        /*margin-left: 50px;*/
    }
</style>

