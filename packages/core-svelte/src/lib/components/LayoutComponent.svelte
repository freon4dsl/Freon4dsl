<svelte:options immutable={true}/>

<script lang="ts">
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

    // Parameters
    export let box: LayoutBox;
    export let editor: FreEditor;

    let LOGGER: FreLogger = new FreLogger("LayoutComponent");
    let id: string ;
    let element: HTMLSpanElement;
    let children: Box[];
    let isHorizontal: boolean;

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
        LOGGER.log("REFRESH LayoutComponent (" + why +")" + box?.element?.freLanguageConcept());
        id = !!box ? componentId(box) : 'layout-for-unknown-box';
        children = [...box.children];
        isHorizontal = box.getDirection() === ListDirection.HORIZONTAL;
    };
    $: { // Evaluated and re-evaluated when the box changes.
        refresh("Refresh Layout box changed " + box?.id);
    }
</script>

<span class="layout-component"
      id="{id}"
      class:horizontal="{isHorizontal}"
      class:vertical="{!isHorizontal}"
      tabIndex={0}
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

<style>
    .layout-component {
        background: transparent;
        padding: var(--freon-horizontallist-component-padding, 1px);
        margin: var(--freon-horizontallist-component-margin, 1px);
        box-sizing: border-box;
    }

    .horizontal {
        white-space: nowrap;
        /*display: inline-block; !* maybe use display: flex; ?? *!*/
        display: flex;
        align-items: var(--freon-horizontallist-component-align-items, baseline);
    }

    .vertical {
        /*width: 100%;*/
    }
</style>
