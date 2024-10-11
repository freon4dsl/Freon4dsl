<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->

<script lang="ts">
	import { MULTILINETEXT_LOGGER } from "$lib/components/ComponentLoggers.js";
	import { afterUpdate, onMount } from "svelte";
	import { componentId } from "$lib/index.js";
	import { FreEditor, MultiLineTextBox } from "@freon4dsl/core";

	// Probably needed to code/encode HTML inside <TextArea>
	// import { replaceHTML } from "./svelte-utils/index.js";

	// TODO find out better way to handle muting/unmuting of LOGGERs
    const LOGGER = MULTILINETEXT_LOGGER

    // Parameters
    export let box: MultiLineTextBox;		// the accompanying box
    export let editor: FreEditor;			// the editor
	export let text: string;    			// the text to be displayed, needs to be exported for to use 'bind:text' in TextDropdownComponent

    // Local variables
    let id: string;                         // an id for the html element
    id = !!box ? componentId(box) : 'text-with-unknown-box';
    let textArea: HTMLTextAreaElement; 		// the text area element on the screen
    let placeholder: string = '<..>';       // the placeholder when value of text component is not present

	/**
	 * When this component is mounted, the setFocus and setCaret functions are
	 * made available to the textbox, and the 'text' and 'originalText' variables
	 * are set.
	 */
	onMount(() => {
		LOGGER.log("onMount" + " for element "  + box?.node?.freId() + " (" + box?.node?.freLanguageConcept() + ")");
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
			if (text !== box.getText()) {
				LOGGER.log(`   text is new value`)
				box.setText(text);
			} else {
				LOGGER.log("Text is unchanged: " + text)
			}
	}

	const refresh = () => {
		LOGGER.log("REFRESH " + box?.node?.freId() + " (" + box?.node?.freLanguageConcept() + ")")
		placeholder = box.placeHolder;
		text = box.getText();
	}

	function onKeyDown(keyEvent: KeyboardEvent) {
		LOGGER.log("Key Event: " + keyEvent.code)
		keyEvent.stopPropagation()
	}

	refresh();
</script>

<textarea
	class="{box.role} multilinetext-box multiline-text-component"
	id="{id}"
	on:focusout={onFocusOut}
	on:keydown={onKeyDown}
	spellcheck=false
	bind:this={textArea}
	placeholder={placeholder}
	bind:value={text}
></textarea>

