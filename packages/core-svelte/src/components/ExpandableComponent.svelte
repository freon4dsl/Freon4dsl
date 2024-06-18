<svelte:options immutable={true}/>
<script lang="ts">
    /**
     * This component expands/collapses the child of its (Expandable)Box.
     * Every indent is 8px wide.
     */
    import { Box, FreLogger } from "@freon4dsl/core";
    import { afterUpdate, onMount } from "svelte";
    import RenderComponent from "./RenderComponent.svelte";
    import type {ExpandableBox, FreEditor} from "@freon4dsl/core";
    import { componentId } from "./svelte-utils";
    import { AccordionItem, Accordion } from 'flowbite-svelte';

    // Parameters
    export let box: ExpandableBox;
    export let editor: FreEditor;

    const LOGGER = new FreLogger("ExpandableComponent");

    // const indentWidth: number = 8;
    // let style: string = `margin-left: ${box?.indent * indentWidth}px;`;
    let id: string = !!box ? componentId(box) : 'expand-for-unknown-box';
    let child: Box;

    onMount( () => {
        box.refreshComponent = refresh;
    });
    afterUpdate( () => {
        box.refreshComponent = refresh;
    })

    let htmlElement: HTMLElement;
    async function setFocus(): Promise<void> {
        htmlElement.focus();
    }

    const refresh = (why?: string): void => {
        LOGGER.log("REFRESH Expand for box (" + why + ") " + box?.role + " child " + box?.child?.role);
        child = box?.child;
        // style = `margin-left: ${box?.indent * indentWidth}px;`

    };
    $: { // Evaluated and re-evaluated when the box changes.
        refresh(box?.$id);
    }

    let content: HTMLDivElement;

    function toggleButton() {
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
      }
</script>

<button class="collapsible" on:click={toggleButton}>Open v3</button>

<div bind:this={content}>
  <p>Lorem ipsum...</p>
  <RenderComponent box={child} editor={editor}/>
</div>



<style>
 .collapsible {
  background-color: #eee;
  color: #444;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
}

/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
.active, .collapsible:hover {
  background-color: #ccc;
}

/* Style the collapsible content. Note: hidden by default */
.content {
  padding: 0 18px;
  display: none;
  overflow: hidden;
  background-color: #f1f1f1;
}
</style>