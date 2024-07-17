<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->

<script lang="ts">
	import { afterUpdate, onMount, onDestroy } from "svelte";
	import { componentId } from "$lib/index.js";
	import { FreEditor, FreLogger, MultiLineTextBox2 } from "@freon4dsl/core";
	import Editor from '@tinymce/tinymce-svelte';
	//import tinymce from '@tinymce/tinymce';
	// import 'tinymce/icons/default/icons';
	// import 'tinymce/plugins/link';
	// import 'tinymce/plugins/table';
	// import 'tinymce/plugins/code';

	import { runInAction } from "mobx";
	// Probably needed to code/encode HTML inside <TextArea>
	// import { replaceHTML } from "./svelte-utils/index.js";

	// TODO find out better way to handle muting/unmuting of LOGGERs
    const LOGGER = new FreLogger("MultiLineTextComponent2"); // .mute(); muting done through webapp/logging/LoggerSettings

    // Parameters
    export let box: MultiLineTextBox2;		// the accompanying box
    export let editor: FreEditor;			// the editor
	export let text: string;    			// the text to be displayed, needs to be exported for to use 'bind:text' in TextDropdownComponent

	let cssClass: string = '';

    // Local variables
    let id: string = !!box ? componentId(box) : 'text-with-unknown-box';
    let textArea: HTMLTextAreaElement; 		// the text area element on the screen
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
		if (!!Editor) {
			
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
		LOGGER.log("Key Event: " + keyEvent.code)
		keyEvent.stopPropagation()
	}

	refresh();

	let conf = {
		menubar: false,
		plugins: 'lists checklist',
		toolbar: 'undo redo | formatselect \
		| fontsize | bold italic underline forecolor backcolor \
		| checklist bullist numlist outdent indent | removeformat',
		skin: 'oxide-dark',
		content_css: 'site.css',
		height: '190px'
	}

</script>

<!-- <textarea id="{id}"
	class="{box.role} multilinetext-box text"
	on:focusout={onFocusOut}
	on:keydown={onKeyDown}
	spellcheck=false
	bind:this={textArea}
	placeholder={placeholder}
	bind:value={text}
></textarea> -->
<Editor id="{id}" bind:value={text} scriptSrc='tinymce/tinymce.min.js',
	{conf}
/>
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
