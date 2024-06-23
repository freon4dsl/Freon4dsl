<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->

<script>import { afterUpdate, onMount } from "svelte";
import { componentId } from "./svelte-utils/index.js";
import { FreEditor, FreLogger, MultiLineTextBox } from "@freon4dsl/core";
import { runInAction } from "mobx";
import { replaceHTML } from "./svelte-utils/index.js";
const LOGGER = new FreLogger("MultiLineTextComponent");
export let box;
export let editor;
export let text;
let id;
id = !!box ? componentId(box) : "text-with-unknown-box";
let textArea;
let placeholder = "<..>";
onMount(() => {
  LOGGER.log("onMount for element " + box?.element?.freId() + " (" + box?.element?.freLanguageConcept() + ")");
  placeholder = box.placeHolder;
  box.setFocus = setFocus;
  box.refreshComponent = refresh;
});
afterUpdate(() => {
  LOGGER.log("Start afterUpdate id: " + id);
  placeholder = box.placeHolder;
  box.setFocus = setFocus;
  box.refreshComponent = refresh;
});
export async function setFocus() {
  LOGGER.log("setFocus " + id);
  if (!!textArea) {
    textArea.focus();
  }
}
const onFocusOut = (e) => {
  LOGGER.log("onFocusOut " + id);
  runInAction(() => {
    if (text !== box.getText()) {
      LOGGER.log(`   text is new value`);
      box.setText(text);
    } else {
      LOGGER.log("Text is unchanged: " + text);
    }
  });
};
const refresh = () => {
  LOGGER.log("REFRESH " + box?.element?.freId() + " (" + box?.element?.freLanguageConcept() + ")");
  placeholder = box.placeHolder;
  text = box.getText();
};
function onKeyDown(keyEvent) {
  LOGGER.log("Key Evenbt: " + keyEvent.code);
  keyEvent.stopPropagation();
}
refresh();
</script>

<textarea
	class="{box.role} multilinetext-box text"
	id="{id}"
	on:focusout={onFocusOut}
	on:keydown={onKeyDown}
	spellcheck=false
	bind:this={textArea}
	placeholder={placeholder}
	bind:value={text}
></textarea>

<style>
    .text {
        color: var(--freon-text-component-color, blue);
        background: var(--freon-text-component-background-color, inherit);
        font-family: var(--freon-text-component-font-family, "Arial");
        font-size: var(--freon-text-component-font-size, 14pt);
        font-weight: var(--freon-text-component-font-weight, inherit);
        font-style: var(--freon-text-component-font-style, inherit);
        padding: var(--freon-text-component-padding, 1px);
        margin: var(--freon-text-component-margin, 1px);
        white-space: normal;
        display: inline-block;
		height: auto;
	}


</style>
