<script lang="ts">
    import { autorun } from "mobx";
    import { onMount } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import {
        Box,
        isEmptyLineBox,
        ListBox,
        PiEditor,
        PiLogger,
        ListDirection
    } from "@projectit/core";


    // Parameters
    export let box: ListBox; // todo change to LayoutBox
    export let editor: PiEditor;

    let LOGGER: PiLogger = new PiLogger("LayoutComponent"); //.mute();
    let id: string = !!box ? box.id : "unknown-label-id";
    let element: HTMLSpanElement;
    let children: Box[] = [];
    $: children = [...box.children];
    let isHorizontal: boolean;
    $: isHorizontal = box.getDirection() === ListDirection.HORIZONTAL;

    async function setFocus(): Promise<void> {
        if (!!element) {
            element.focus();
        }
    }

    onMount(() => {
        box.setFocus = setFocus;
    });

    autorun(() => {
        LOGGER.log("Autorun")
        children = [...box.children];
        box.setFocus = setFocus;
    });

</script>

<span class="layout-component" class:horizontal="{isHorizontal}" class:vertical="{!isHorizontal}"
      bind:this={element}
>
    {#if isHorizontal }
        {#each children as child (child.id)}
            <RenderComponent box={child} editor={editor}/>
        {/each}
    {:else}
        {#each children as child, i (child.id)}
            {#if i > 0 && i < children.length && !(isEmptyLineBox(children[i - 1]))}
                <br/>
            {/if}
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
        align-items: baseline;
    }

    .vertical {
        /*width: 100%;*/
    }
</style>
