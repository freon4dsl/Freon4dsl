<svelte:options immutable={true}/>
<script lang="ts">
    /**
     * This component indents the child of its (Indent)Box.
     * Every indent is 8px wide.
     */
    import { Box, FreLogger } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import type {IndentBox, FreEditor} from "@freon4dsl/core";
    import { componentId } from "./svelte-utils/index.js";

    // Parameters
    export let box: IndentBox;
    export let editor: FreEditor;

    const LOGGER = new FreLogger("IndentComponent");
 
    const indentWidth: number = 8;
    let style: string = `margin-left: ${box?.indent * indentWidth}px;`;
    if (box?.fullWidth) {
         style = `width: 100%; ${style}`;
    }
    let id: string = !!box ? componentId(box) : 'indent-for-unknown-box';
    let cssClass: string = '';
    let child: Box;

    onMount( () => {
        box.refreshComponent = refresh;
    });
    afterUpdate( () => {
        box.refreshComponent = refresh;
    })

    const refresh = (why?: string): void => {
        if (!!box) {
            LOGGER.log("REFRESH Indent for box (" + why + ") " + box?.role + " child " + box?.child?.role);
            child = box?.child;
            style = `margin-left: ${box?.indent * indentWidth}px;`
            if (box?.fullWidth)  style = `width: 100%; ${style}`;
            cssClass = box.cssClass;
        }
    };
    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }
</script>

<span id="{id}" class="{cssClass}" style="{style}">
    <RenderComponent box={child} editor={editor}/>
</span>
