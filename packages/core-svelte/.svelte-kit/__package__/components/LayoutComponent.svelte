<svelte:options immutable={true}/>

<script>import { afterUpdate, onMount } from "svelte";
import RenderComponent from "./RenderComponent.svelte";
import {
  Box,
  FreEditor,
  FreLogger,
  ListDirection,
  LayoutBox
} from "@freon4dsl/core";
import { componentId } from "./svelte-utils/index.js";
export let box;
export let editor;
let LOGGER = new FreLogger("LayoutComponent");
let id;
let element;
let children;
let isHorizontal;
async function setFocus() {
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
const refresh = (why) => {
  LOGGER.log("REFRESH LayoutComponent (" + why + ")" + box?.element?.freLanguageConcept());
  id = !!box ? componentId(box) : "layout-for-unknown-box";
  children = [...box.children];
  isHorizontal = box.getDirection() === ListDirection.HORIZONTAL;
};
$: {
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
