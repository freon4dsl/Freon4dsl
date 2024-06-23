<svelte:options immutable={true}/>
<script>import {
  isActionBox,
  isEmptyLineBox,
  isGridBox,
  isTableBox,
  isIndentBox,
  isLabelBox,
  isLayoutBox,
  isListBox,
  isOptionalBox,
  isSelectBox,
  isTextBox,
  isSvgBox,
  FreEditor,
  FreLogger,
  Box,
  isElementBox,
  isOptionalBox2,
  isMultiLineTextBox
} from "@freon4dsl/core";
import MultiLineTextComponent from "./MultiLineTextComponent.svelte";
import EmptyLineComponent from "./EmptyLineComponent.svelte";
import GridComponent from "./GridComponent.svelte";
import IndentComponent from "./IndentComponent.svelte";
import LabelComponent from "./LabelComponent.svelte";
import LayoutComponent from "./LayoutComponent.svelte";
import ListComponent from "./ListComponent.svelte";
import OptionalComponent from "./OptionalComponent.svelte";
import OptionalComponentNew from "./OptionalComponentNew.svelte";
import TableComponent from "./TableComponent.svelte";
import TextComponent from "./TextComponent.svelte";
import TextDropdownComponent from "./TextDropdownComponent.svelte";
import SvgComponent from "./SvgComponent.svelte";
import { afterUpdate } from "svelte";
import { selectedBoxes } from "./svelte-utils/DropAndSelectStore.js";
import { componentId, setBoxSizes } from "./svelte-utils/index.js";
import ElementComponent from "./ElementComponent.svelte";
const LOGGER = new FreLogger("RenderComponent").mute();
export let box = null;
export let editor;
let id;
let className = "";
let element;
const onClick = (event) => {
  LOGGER.log("RenderComponent.onClick for box " + box.role + ", selectable:" + box.selectable);
  editor.selectElementForBox(box);
  event.preventDefault();
  event.stopPropagation();
};
afterUpdate(() => {
  LOGGER.log("afterUpdate selectedBoxes: [" + $selectedBoxes.map((b) => b?.element?.freId() + "=" + b?.element?.freLanguageConcept() + "=" + b?.kind) + "]");
  let isSelected = $selectedBoxes.includes(box);
  className = isSelected ? "selected" : "unSelected";
  if (!!element) {
    setBoxSizes(box, element.getBoundingClientRect());
  } else {
    LOGGER.log("No element for " + box?.id + " " + box?.kind);
  }
});
const refresh = (why) => {
  LOGGER.log("REFRESH RenderComponent (" + why + ")");
  id = !!box ? `render-${componentId(box)}` : "render-for-unknown-box";
};
let first = true;
refresh((first ? "first" : "later") + "   " + box?.id);
first = false;
</script>

<!-- TableRows are not included here, because they use the CSS grid and tablecells must in HTML
     always be directly under the main grid.
-->
<!-- ElementBoxes are without span, because they are not shown themselves.
     Their children are, and each child gets its own surrounding RenderComponent.
-->
{#if isElementBox(box) }
    <ElementComponent box={box} editor={editor}/>
{:else}
    <span id={id}
          class="render-component {className}"
          on:click={onClick}
          bind:this={element}
    >
        {#if box === null || box === undefined }
            <p class="error">[BOX IS NULL OR UNDEFINED]</p>
        {:else if isEmptyLineBox(box) }
            <EmptyLineComponent box={box}/>
        {:else if isGridBox(box) }
            <GridComponent box={box} editor={editor} />
        {:else if isIndentBox(box) }
            <IndentComponent box={box} editor={editor}/>
        {:else if isLabelBox(box)}
            <LabelComponent box={box}/>
        {:else if isLayoutBox(box) }
            <LayoutComponent box={box} editor={editor}/>
        {:else if isListBox(box) }
            <ListComponent box={box} editor={editor}/>
        {:else if isOptionalBox(box) }
            <OptionalComponent box={box} editor={editor}/>
        {:else if isOptionalBox2(box) }
            <OptionalComponentNew box={box} editor={editor}/>
        {:else if isSvgBox(box) }
            <SvgComponent box={box}/>
        {:else if isTableBox(box) }
            <TableComponent box={box} editor={editor} />
        {:else if isTextBox(box) }
            <TextComponent box={box} editor={editor} partOfActionBox={false} text="" isEditing={false}/>
        {:else if isMultiLineTextBox(box) }
            <MultiLineTextComponent box={box} editor={editor} text=""/>
        {:else if isActionBox(box) || isSelectBox(box)}
            <TextDropdownComponent box={box} editor={editor}/>
        {:else}
            <p class="error">[UNKNOWN BOX TYPE: {box.kind}]</p>
        {/if}
    </span>
{/if}

<style>
    .render-component {
        box-sizing: border-box;
        display: flex;
    }
    .error {
        color: var(--freon-dropdownitem-component-error-bg-color, red);
    }
    .unSelected {
        background: transparent;
        border: none;
    }
    .selected {
        background-color: var(--freon-selected-background-color, rgba(211, 227, 253, 255));
        outline-color: var(--freon-selected-outline-color, darkblue);
        outline-style: var(--freon-selected-outline-style, solid);
        outline-width: var(--freon-selected-outline-width, 1px);
    }
</style>
