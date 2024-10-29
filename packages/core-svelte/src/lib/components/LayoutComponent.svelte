<svelte:options immutable={true}/>

<script lang="ts">
    import { LAYOUT_LOGGER } from "$lib/components/ComponentLoggers.js";

    /**
     * This component shows a list of various boxes (no 'true' list). It can be shown
     * horizontally or vertically. In the latter case, the elements are each separated by
     * a break ('<br>').
     */
    import { afterUpdate, onMount } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import {
        Box,
        FreEditor,
        FreLogger,
        ListDirection,
        LayoutBox
    } from "@freon4dsl/core";
    import { componentId } from "$lib/index.js";
    import ErrorMarker from "$lib/components/ErrorMarker.svelte";

    // Parameters
    export let box: LayoutBox;
    export let editor: FreEditor;

    let LOGGER: FreLogger = LAYOUT_LOGGER
    let id: string ;
    let element: HTMLSpanElement;
    let children: Box[];
    let isHorizontal: boolean;

    let errorCls: string = '';              // css class name for when the node is erroneous
    let errMess: string[] = [];             // error message to be shown when element is hovered

    async function setFocus(): Promise<void> {
        if (!!element) {
            element.focus();
        }
    }

    onMount(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    afterUpdate(() => {
        box.setFocus = setFocus;
        box.refreshComponent = refresh;
    });

    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH LayoutComponent (" + why +")" + box?.node?.freLanguageConcept());
        id = !!box ? componentId(box) : 'layout-for-unknown-box';
        children = [...box.children];
        isHorizontal = box.getDirection() === ListDirection.HORIZONTAL;
        if (box.hasError) {
            errorCls = !isHorizontal ? 'layout-component-vertical-error' : 'layout-component-horizontal-error';
            errMess = box.errorMessages;
        } else {
            errorCls = "";
            errMess = [];
        }
    };

    $: { // Evaluated and re-evaluated when the box changes.
        refresh("Refresh Layout box changed " + box?.id);
    }
</script>

{#if errMess.length > 0}
    <ErrorMarker element={element} {box}/>
{/if}
<span class="layout-component {errorCls}"
      id="{id}"
      class:layout-component-horizontal="{isHorizontal}"
      class:layout-component-vertical="{!isHorizontal}"
      tabindex="-1"
      bind:this={element}
>
    {#if isHorizontal }
        {#each children as child (child.id)}
            <RenderComponent box={child} editor={editor}/>
        {/each}
    {:else}
        {#each children as child, i (child.id)}
<!--            {#if i > 0 && i < children.length && !(isEmptyLineBox(children[i - 1]))}
                <br/>
            {/if}
-->
            <RenderComponent box={child} editor={editor}/>
        {/each}
    {/if}
</span>
