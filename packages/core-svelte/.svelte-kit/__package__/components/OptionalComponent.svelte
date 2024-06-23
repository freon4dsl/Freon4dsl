<svelte:options immutable={true}/>
<script>import RenderComponent from "./RenderComponent.svelte";
import { onMount, afterUpdate } from "svelte";
import { OptionalBox, FreLogger, Box } from "@freon4dsl/core";
import { componentId } from "./svelte-utils/index.js";
export let box;
export let editor;
const LOGGER = new FreLogger("OptionalComponent");
let id;
id = !!box ? componentId(box) : "optional-for-unknown-box";
let childBox;
let mustShow = false;
let showByCondition = false;
let contentComponent;
let placeholderComponent;
const refresh = (why) => {
  LOGGER.log("REFRESH OptionalBox: " + why);
  mustShow = box.mustShow;
  showByCondition = box.condition();
  childBox = box.content;
};
async function setFocus() {
  LOGGER.log("OptionalComponent.setFocus on box " + box.role);
  if (mustShow || showByCondition && !!contentComponent) {
    box.content.firstEditableChild.setFocus();
  } else if (!!placeholderComponent) {
    box.placeholder.setFocus();
  } else {
    console.error("OptionalComponent " + id + " has no elements to put focus on");
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
$: {
  refresh(box?.$id);
}
</script>

<span class="optional"
      id="{id}"
>
    {#if mustShow || showByCondition}
        <RenderComponent box={childBox} editor={editor} bind:this={contentComponent}/>
    {:else}
        <RenderComponent box={box.placeholder} editor={editor} bind:this={placeholderComponent}/>
    {/if}
</span>

<style>
    .optional:empty:before {
        content: attr(data-placeholdertext);
    }

    .optional {
        padding: 3px;
        white-space: normal;
        display: inline-block;
    }
</style>
