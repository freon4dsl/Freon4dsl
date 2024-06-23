<svelte:options immutable={true}/>
<script>import RenderComponent from "./RenderComponent.svelte";
import { onMount, afterUpdate } from "svelte";
import { FreLogger, ElementBox, Box } from "@freon4dsl/core";
import { componentId } from "./svelte-utils/index.js";
export let box;
export let editor;
const LOGGER = new FreLogger("ElementComponent");
let id;
let childBox;
const refresh = (why) => {
  LOGGER.log("REFRESH ElementComponent (" + why + ")" + box?.element?.freLanguageConcept());
  if (!!box) {
    id = componentId(box);
    childBox = box.content;
  } else {
    id = "element-for-unknown-box";
  }
};
async function setFocus() {
  LOGGER.log("ListComponent.setFocus for box " + box.role);
  if (!!box) {
    box.content.setFocus();
  }
}
onMount(() => {
  box.refreshComponent = refresh;
  box.setFocus = setFocus;
});
afterUpdate(() => {
  box.refreshComponent = refresh;
  box.setFocus = setFocus;
});
$: {
  refresh(box?.$id);
}
</script>

<RenderComponent box={childBox} editor={editor} />
