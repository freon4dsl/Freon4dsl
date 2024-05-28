<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->

<script lang="ts">
	import { afterUpdate, onMount } from "svelte";
	import { componentId } from "./svelte-utils";
	import { FreEditor, FreLogger, MultiLineTextBox } from "@freon4dsl/core";

	import { runInAction } from "mobx";
	// Probably needed to code/encode HTML inside <TextArea>
	import { replaceHTML } from "./svelte-utils";

	// TODO find out better way to handle muting/unmuting of LOGGERs
    const LOGGER = new FreLogger("MultiLineTextComponent"); // .mute(); muting done through webapp/logging/LoggerSettings

    // Parameters
    export let box: MultiLineTextBox;		// the accompanying box
    export let editor: FreEditor;			// the editor
	export let text: string;    			// the text to be displayed, needs to be exported for to use 'bind:text' in TextDropdownComponent

    // Local variables
    let id: string;                         // an id for the html element
    id = !!box ? componentId(box) : 'text-with-unknown-box';
    let textArea: HTMLAreaElement  ; 	// the teaxt area element on the screen
    let placeholder: string = '<..>';       // the placeholder when value of text component is not present


	/**
	 * When this component is mounted, the setFocus and setCaret functions are
	 * made available to the textbox, and the 'text' and 'originalText' variables
	 * are set.
	 */
	onMount(() => {
		LOGGER.log("onMount" + " for element "  + box?.element?.freId() + " (" + box?.element?.freLanguageConcept() + ")");
		placeholder = box.placeHolder;
		box.setFocus = setFocus;
		box.refreshComponent = refresh;
	});

	/**
	 */
	afterUpdate(() => {
		LOGGER.log("Start afterUpdate id: " + id);
		placeholder = box.placeHolder
		box.setFocus = setFocus;
		box.refreshComponent = refresh;
	});

	/**
     * This function sets the focus on this element programmatically.
     * It is called from the box.
     */
	export async function setFocus(): Promise<void> {
		LOGGER.log("setFocus "+ id);
		if (!!textArea) {
			textArea.focus();
		}
	}

    /**
     * When this component loses focus, do everything that is needed to end the editing state.
     */
	const onFocusOut = (e) => {
		LOGGER.log("onFocusOut " + id)
		runInAction(() => {
			if (text !== box.getText()) {
				LOGGER.log(`   text is new value`)
				box.setText(text);
			} else {
				LOGGER.log("Text is unchanged: " + text)
			}
		});
	}

	const refresh = () => {
		LOGGER.log("REFRESH " + box?.element?.freId() + " (" + box?.element?.freLanguageConcept() + ")")
		placeholder = box.placeHolder;
		text = box.getText();
	}

	function onKeyDown(keyEvent: KeyboardEvent) {
		LOGGER.log("Key Evenbt: " + keyEvent.code)
		keyEvent.stopPropagation()
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
