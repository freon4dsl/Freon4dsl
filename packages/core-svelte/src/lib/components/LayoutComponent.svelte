<svelte:options immutable={true}/>

<script lang="ts">
    /**
     * This component shows a list of various boxes (no 'true' list). It can be shown
     * horizontally or vertically. In the latter case, the elements are each separated by
     * a break ('<br>').
     */
    import { afterUpdate, onMount } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import {Box, FreEditor, FreLogger, ListDirection, LayoutBox } from "@freon4dsl/core";
    import { componentId } from "$lib/index.js";

    // Parameters
    export let box: LayoutBox;
    export let editor: FreEditor;

    let LOGGER: FreLogger = new FreLogger("LayoutComponent");
    let id: string ;
    let element: HTMLSpanElement;
    let children: Box[];
    let isHorizontal: boolean;
    let alignment = 'center';

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
        alignment = box.getAlignment();
    };
    $: { // Evaluated and re-evaluated when the box changes.
        refresh("Refresh Layout box changed " + box?.id);
    }
    $: style = isHorizontal ? `align-items: ${getAlignment(alignment)};` : '';

  
    function getAlignment(alignment:any) {
        switch (alignment) {
            case 'top':
                return 'flex-start';
            case 'center':
                return 'center';
            case 'bottom':
                return 'flex-end';
            default:
                return 'center';
        }
    }
</script>

<span class="layout-component"
      id="{id}"
      class:horizontal="{isHorizontal}"
      class:vertical="{!isHorizontal}"
      tabIndex={0}
      bind:this={element}
      style="{style}"
>
    {#if isHorizontal }
        {#each children as child (child.id)}
            <RenderComponent box={child} editor={editor}/>
        {/each}
    {:else}
        {#each children as child, i (child.id)}
            <RenderComponent box={child} editor={editor}/>
        {/each}
    {/if}
</span>

<style>
    .layout-component {
        background: transparent;
        box-sizing: border-box;
    }

    .horizontal {
        white-space: nowrap;
        display: flex;
        padding: var(--freon-horizontallayout-component-padding, 1px);
        margin: var(--freon-horizontallayout-component-margin, 1px);
    }

    .vertical {
        width: 100%;
        padding: var(--freon-verticallayout-component-padding, 1px);
        margin: var(--freon-verticallayout-component-margin, 1px);
    }
</style>
