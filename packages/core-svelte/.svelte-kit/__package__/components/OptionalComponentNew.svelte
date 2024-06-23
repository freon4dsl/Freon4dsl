<svelte:options immutable={true}/>
<script>import RenderComponent from "./RenderComponent.svelte";
import { onMount, afterUpdate } from "svelte";
import { OptionalBox2, FreLogger, Box } from "@freon4dsl/core";
import { componentId } from "./svelte-utils/index.js";
export let box;
export let editor;
const LOGGER = new FreLogger("OptionalComponentNew");
let id;
id = !!box ? componentId(box) : "optional2-for-unknown-box";
let childBox;
let optionalBox;
let mustShow = false;
let showByCondition = false;
let contentComponent;
let placeholderComponent;
const refresh = (why) => {
  LOGGER.log("REFRESH OptionalBox2: " + why);
  mustShow = box.mustShow;
  showByCondition = box.condition();
  childBox = box.content;
  optionalBox = box.placeholder;
};
async function setFocus() {
  LOGGER.log("setFocus on box " + box.role);
  if (mustShow || showByCondition && !!contentComponent) {
    box.content.firstEditableChild.setFocus();
  } else if (!!placeholderComponent) {
    box.placeholder.setFocus();
  } else {
    console.error("OptionalComponent2 " + id + " has no elements to put focus on");
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

<span class="optional2"
      id="{id}"
>
    {#if mustShow || showByCondition}
        <span class="optionalShow2">
            <RenderComponent box={childBox} editor={editor} bind:this={contentComponent}/>
        </span>
    {:else}
        <span class="optionalHide2">
            <RenderComponent box={optionalBox} editor={editor} bind:this={placeholderComponent}/>
        </span>
    {/if}
</span>

<style>
    .optional2:empty:before {
        content: attr(data-placeholdertext);
        background-color: purple;
    }

    .optionalShow2 {
        padding: 3px;
        white-space: normal;
        display: inline-block;
    }
    .optionalHide2 {
        padding: 3px;
        white-space: normal;
        display: inline-block;
        color: lightgrey;
    }
</style>
