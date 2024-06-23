<svelte:options immutable={true}/>
<script>import { Box, FreLogger } from "@freon4dsl/core";
import { afterUpdate, onMount } from "svelte";
import RenderComponent from "./RenderComponent.svelte";
import { componentId } from "./svelte-utils/index.js";
export let box;
export let editor;
const LOGGER = new FreLogger("IndentComponent");
const indentWidth = 8;
let style = `margin-left: ${box?.indent * indentWidth}px;`;
let id = !!box ? componentId(box) : "indent-for-unknown-box";
let child;
onMount(() => {
  box.refreshComponent = refresh;
});
afterUpdate(() => {
  box.refreshComponent = refresh;
});
const refresh = (why) => {
  LOGGER.log("REFRESH Indent for box (" + why + ") " + box?.role + " child " + box?.child?.role);
  child = box?.child;
  style = `margin-left: ${box?.indent * indentWidth}px;`;
};
$: {
  refresh(box?.$id);
}
</script>

<span
    style="{style}"
    id="{id}"
>
    <RenderComponent box={child} editor={editor}/>
</span>
