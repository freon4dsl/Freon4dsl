<script>import {
  FreEditor,
  FreLogger,
  Box,
  ARROW_UP,
  ARROW_DOWN,
  TAB,
  BACKSPACE,
  ARROW_LEFT,
  DELETE,
  ENTER,
  ARROW_RIGHT,
  isNullOrUndefined,
  isTableRowBox,
  isElementBox
} from "@freon4dsl/core";
import RenderComponent from "./RenderComponent.svelte";
import ContextMenu from "./ContextMenu.svelte";
import { afterUpdate, onMount, tick } from "svelte";
import { contextMenu, contextMenuVisible, selectedBoxes, viewport, componentId } from "./svelte-utils/index.js";
let LOGGER = new FreLogger("FreonComponent");
export let editor;
let element;
let rootBox;
let id;
id = !!rootBox ? componentId(rootBox) : "freon-component-with-unknown-box";
function stopEvent(event) {
  event.preventDefault();
  event.stopPropagation();
}
const onKeyDown = (event) => {
  LOGGER.log("FreonComponent onKeyDown: " + event.key + " ctrl: " + event.ctrlKey + " alt: " + event.altKey + " shift: " + event.shiftKey);
  if (event.ctrlKey || event.altKey) {
    switch (event.key) {
      case ARROW_UP:
        editor.selectParent();
        stopEvent(event);
        break;
      case ARROW_DOWN:
        editor.selectFirstLeafChildBox();
        stopEvent(event);
        break;
    }
  } else if (event.shiftKey) {
    switch (event.key) {
      case TAB:
        editor.selectPreviousLeaf();
        stopEvent(event);
        break;
    }
  } else if (event.altKey) {
  } else {
    switch (event.key) {
      case BACKSPACE:
      case ARROW_LEFT:
        editor.selectPreviousLeaf();
        stopEvent(event);
        break;
      case DELETE:
        editor.deleteBox(editor.selectedBox);
        stopEvent(event);
        break;
      case TAB:
      case ENTER:
      case ARROW_RIGHT:
        editor.selectNextLeaf();
        stopEvent(event);
        break;
      case ARROW_DOWN:
        editor.selectBoxBelow(editor.selectedBox);
        stopEvent(event);
        break;
      case ARROW_UP:
        LOGGER.log("Up: " + editor.selectedBox.role);
        editor.selectBoxAbove(editor.selectedBox);
        stopEvent(event);
        break;
    }
  }
};
function onScroll() {
  $contextMenuVisible = false;
  setTimeout(() => {
    editor.scrollX = element.scrollLeft;
    editor.scrollY = element.scrollTop;
  }, 400);
}
onMount(() => {
  const resizeObserver = new ResizeObserver((entries) => {
    $contextMenuVisible = false;
    setTimeout(() => {
      const entry = entries.at(0);
      let rect = entry.target.getBoundingClientRect();
      $viewport.setSizes(rect.height, rect.width, rect.top, rect.left);
    }, 400);
  });
  resizeObserver.observe(element);
  editor.refreshComponentSelection = refreshSelection;
  editor.refreshComponentRootBox = refreshRootBox;
  return () => resizeObserver.unobserve(element);
});
afterUpdate(() => {
  editor.refreshComponentSelection = refreshSelection;
  editor.refreshComponentRootBox = refreshRootBox;
});
const refreshSelection = async (why) => {
  LOGGER.log("FreonComponent.refreshSelection: " + why + " editor selectedBox is " + editor?.selectedBox?.kind);
  if (!isNullOrUndefined(editor.selectedBox) && !$selectedBoxes.includes(editor.selectedBox)) {
    await tick();
    $selectedBoxes = getSelectableChildren(editor.selectedBox);
    editor.selectedBox.setFocus();
  }
};
function getSelectableChildren(box) {
  const result = [];
  if (isTableRowBox(box)) {
    for (const child of box.children) {
      result.push(...getSelectableChildren(child));
    }
  } else if (isElementBox(box)) {
    result.push(...getSelectableChildren(box.content));
  } else {
    result.push(box);
  }
  return result;
}
const refreshRootBox = (why) => {
  rootBox = editor.rootBox;
  LOGGER.log("REFRESH " + why + " ==================> FreonComponent with rootbox " + rootBox?.id);
};
refreshRootBox("Initialize FreonComponent");
refreshSelection("Initialize FreonComponent");
</script>

<div class={"freon"}
     on:keydown={onKeyDown}
     on:scroll={onScroll}
     bind:this={element}
     id="{id}"
>
    <RenderComponent editor={editor}
                     box={rootBox}
    />
</div>
<!-- Here the only instance of ContextMenu is defined -->
<!-- TODO make some default items for the context menu -->
<ContextMenu bind:this={$contextMenu} items={[]} editor={editor}/>

<style>
    .freon {
        height: 100%;
        width: 100%;
        overflow-x: auto;
        font-size: var(--freon-editor-component-font-size, 14px);
        font-style: var(--freon-editor-component-font-style, italic);
        font-weight: var(--freon-editor-component-font-weight, normal);
        font-family: var(--freon-editor-component-font-family, "Arial");
        color: var(--freon-editor-component-color, darkblue);
        background-color: var(--freon-editor-component-background-color, white);
        margin: var(--freon-editor-component-margin, 1px);
        padding: var(--freon-editor-component-padding, 1px);

    }
</style>
