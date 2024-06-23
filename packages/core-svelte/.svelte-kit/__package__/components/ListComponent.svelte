<svelte:options immutable={true}/>
<script>import { flip } from "svelte/animate";
import {
  Box,
  dropListElement,
  isActionBox,
  isNullOrUndefined,
  FreLanguage,
  ListBox,
  ListDirection,
  ListElementInfo,
  MenuOptionsType,
  moveListElement,
  FreEditor,
  FreLogger
} from "@freon4dsl/core";
import RenderComponent from "./RenderComponent.svelte";
import {
  activeElem,
  activeIn,
  draggedElem,
  draggedFrom,
  contextMenu,
  contextMenuVisible,
  componentId
} from "./svelte-utils/index.js";
import { afterUpdate, onMount } from "svelte";
export let box;
export let editor;
let LOGGER = new FreLogger("ListComponent");
let id;
let htmlElement;
let isHorizontal;
let shownElements;
let myMetaType;
$: myMetaType = box.conceptName;
const drop = (event, targetIndex) => {
  const data = $draggedElem;
  LOGGER.log("drag DROPPING item [" + data.element.freId() + "] from [" + data.componentId + "] in list [" + id + "] on position [" + targetIndex + "]");
  if (data.componentId === id) {
    moveListElement(box.element, data.element, box.propertyName, targetIndex);
  } else {
    dropListElement(editor, data, myMetaType, box.element, box.propertyName, targetIndex);
  }
  $draggedElem = null;
  $draggedFrom = "";
  $activeElem = { row: -1, column: -1 };
  $activeIn = "";
};
const dragend = (event, listId, listIndex) => {
  LOGGER.log("Drag End " + box.id);
  return false;
};
const dragstart = (event, listId, listIndex) => {
  LOGGER.log("Drag Start " + box.id + " index: " + listIndex);
  $contextMenuVisible = false;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.dropEffect = "move";
  $draggedElem = new ListElementInfo(shownElements[listIndex].element, id);
  $draggedFrom = listId;
};
const dragleave = (event, index) => {
  LOGGER.log("Drag Leave" + box.id + " index: " + index);
  return false;
};
const dragenter = (event, index) => {
  LOGGER.log("Drag Enter" + box.id + " index: " + index);
  event.preventDefault();
  const data = $draggedElem;
  if (isNullOrUndefined($draggedElem)) {
    return;
  }
  if (FreLanguage.getInstance().metaConformsToType(data.element, myMetaType)) {
    $activeElem = { row: index, column: -1 };
    $activeIn = id;
  }
  return false;
};
const dragover = (event, index) => {
  LOGGER.log("drag over " + box.id);
  event.preventDefault();
  return false;
};
const mouseout = () => {
  LOGGER.log("LIST mouse out " + box.id);
  if (isNullOrUndefined($draggedElem)) {
    return;
  }
  $activeElem = { row: -1, column: -1 };
  $activeIn = "";
  return false;
};
function showContextMenu(event, index) {
  if (index >= 0 && index <= shownElements.length) {
    const elemBox = shownElements[index];
    if (editor.selectedBox !== elemBox) {
      editor.selectElementForBox(elemBox);
    }
    if (isActionBox(elemBox)) {
      $contextMenu.items = box.options(MenuOptionsType.placeholder, index);
    } else {
      $contextMenu.items = box.options(MenuOptionsType.normal, index);
    }
    $contextMenu.show(event, index);
  }
}
async function setFocus() {
  LOGGER.log("ListComponent.setFocus for box " + box.role);
  if (!!htmlElement) {
    htmlElement.focus();
  }
}
onMount(() => {
  LOGGER.log("ListComponent onMount --------------------------------");
  box.setFocus = setFocus;
  box.refreshComponent = refresh;
});
afterUpdate(() => {
  LOGGER.log("ListComponent.afterUpdate for " + box.role);
  box.setFocus = setFocus;
  box.refreshComponent = refresh;
});
const onFocusHandler = (e) => {
  LOGGER.log("ListComponent.onFocus for box " + box.role);
};
const onBlurHandler = (e) => {
  LOGGER.log("ListComponent.onBlur for box " + box.role);
};
function setPrevious(b) {
  previousBox = b;
  return "";
}
let previousBox = null;
const refresh = (why) => {
  LOGGER.log("REFRESH ListComponent( " + why + ") " + box?.element?.freLanguageConcept());
  shownElements = [...box.children];
  id = !!box ? componentId(box) : "list-for-unknown-box";
  isHorizontal = !!box ? box.getDirection() === ListDirection.HORIZONTAL : false;
};
$: {
  refresh("Refresh from ListComponent box changed:   " + box?.id);
}
</script>

<!-- on:focus is here to avoid a known bug in svelte 3.4*: "A11y: on:mouseover must be accompanied by on:focus with Svelte v3.40 #285" -->
<!-- Likewise on:blur is needed for on:mouseout -->
<span class={isHorizontal ? "horizontalList" : "verticalList"}
      id="{id}"
      bind:this={htmlElement}
      tabindex={0}
      style:grid-template-columns="{!isHorizontal ? 1 : shownElements.length}"
      style:grid-template-rows="{isHorizontal ? 1 : shownElements.length}"
>
    {#each shownElements as box, index (box.id)}
        <span
                class="list-item"
                class:is-active={$activeElem?.row === index && $activeIn === id}
                class:dragged={$draggedElem?.row === index && $draggedFrom === id}
                style:grid-column="{!isHorizontal ? 1 : index+1}"
                style:grid-row="{isHorizontal ? 1 : index+1}"
                animate:flip
                draggable=true
                on:dragstart|stopPropagation={event => dragstart(event, id, index)}
                on:dragend|stopPropagation={event => dragend(event, id, index)}
                on:drop|stopPropagation={event => drop(event, index)}
                on:dragover|preventDefault={event => {}}
                on:dragenter|stopPropagation={(event) => dragenter(event, index)}
                on:dragleave|stopPropagation={(event) => dragleave(event, index)}
                on:mouseout|stopPropagation={mouseout}
                on:focus={() => {}}
                on:blur={() => {}}
                on:contextmenu|stopPropagation|preventDefault={(event) => showContextMenu(event, index)}
        >
            <RenderComponent box={box} editor={editor}/>
		</span>
    {/each}
</span>


<style>
    .list-component {
        --fre-list-grid-template-columns: "";
        --fre-list-grid-template-rows: "";
    }
    .horizontalList {
        /*grid-template-rows: var(--fre-list-grid-template-rows);*/
        /*grid-template-columns: var(--fre-list-grid-template-columns);*/
        white-space: nowrap;
        display: grid;
        padding: var(--freon-horizontallist-component-padding, 1px);
        background-color: var(--freon-editor-component-background-color, white);
        border-color: var(--freon-horizontallist-component-border-color, darkgreen);
        border-width: var(--freon-horizontallist-component-border-width, 0pt);
        border-style: var(--freon-horizontallist-component-border-style, solid);
        margin: var(--freon-horizontallist-component-margin, 1px);
        box-sizing: border-box;
    }

    .verticalList {
        /*grid-template-rows: var(--fre-list-grid-template-rows);*/
        /*grid-template-columns: var(--fre-list-grid-template-columns);*/
        /*display: grid;*/
        /*background-color: var(--freon-editor-component-background-color, white);*/
        padding: var(--freon-verticallist-component-padding, 1px);
        margin: var(--freon-verticallist-component-margin, 1px);
        border-color: var(--freon-verticallist-component-border-color, red);
        border-width: var(--freon-verticallist-component-border-width, 0pt);
        border-style: var(--freon-verticallist-component-border-style, solid);

        /*margin-top: 10px;*/
        box-sizing: border-box;
    }
</style>


