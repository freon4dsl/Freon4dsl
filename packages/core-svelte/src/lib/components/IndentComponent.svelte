<svelte:options immutable={true}/>
<script lang="ts">
    import { INDENT_LOGGER } from "$lib/components/ComponentLoggers.js";

    /**
     * This component indents the child of its (Indent)Box.
     * Every indent is 8px wide.
     */
    import { Box } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import type {IndentBox, FreEditor} from "@freon4dsl/core";
    import { componentId } from "./svelte-utils/index.js";

    // Parameters
    export let box: IndentBox;
    export let editor: FreEditor;

    const LOGGER = INDENT_LOGGER

    const indentWidth: number = 8;
    let style: string = `margin-left: ${box?.indent * indentWidth}px;`;
    let id: string = !!box ? componentId(box) : 'indent-for-unknown-box';
    let child: Box;
 
    onMount( () => {
        box.refreshComponent = refresh;
    });

    afterUpdate( () => {
        box.refreshComponent = refresh;
    })

    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH Indent for box (" + why + ") " + box?.role + " child " + box?.child?.role);
        child = box?.child;
        style = `margin-left: ${box?.indent * indentWidth}px;`
    };

    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
</script>

<span
    style="{style}"
    id="{id}"
>
    <RenderComponent box={child} editor={editor}/>
</span>
