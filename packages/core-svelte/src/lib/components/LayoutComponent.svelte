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
    import ErrorTooltip from "$lib/components/ErrorTooltip.svelte";

    // Parameters
    export let box: LayoutBox;
    export let editor: FreEditor;

    let LOGGER: FreLogger = new FreLogger("LayoutComponent");
    let id: string ;
    let element: HTMLSpanElement;
    let children: Box[];
    let isHorizontal: boolean;

    let errorCls: string = '';              // css class name for when the node is erroneous
    let errMess: string[] = [];             // error message to be shown when element is hovered
    let hasErr: boolean = false;            // indicates whether this box has errors

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
            hasErr = true;
        } else {
            errorCls = "";
            errMess = [];
            hasErr = false;
        }
        // todo remove this if-stat
        if (errorCls.length > 0) {
            console.log("REFRESH TextComponent " + box?.node?.freLanguageConcept() + ", err: " + errorCls);
        }
    };

    $: { // Evaluated and re-evaluated when the box changes.
        refresh("Refresh Layout box changed " + box?.id);
    }
</script>

<span class="layout-component {errorCls}"
      id="{id}"
      class:layout-component-horizontal="{isHorizontal}"
      class:layout-component-vertical="{!isHorizontal}"
      tabIndex={0}
      bind:this={element}
>
    {#if hasErr}
        <ErrorTooltip content={errMess} hasErr={hasErr}>
            <!-- We add a non breaking space here to ensure that the element has a height and a width. -->
            <!-- This trick does not work in all browsers, so the styling should be done carefully. -->
            <div class="error-marker">&nbsp</div>
        </ErrorTooltip>
    {/if}
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
