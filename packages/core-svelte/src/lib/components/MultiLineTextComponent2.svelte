<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->

<script lang="ts">
	import { afterUpdate, onMount } from "svelte";
	import { componentId } from "$lib/index.js";
	import { FreEditor, FreLogger, MultiLineTextBox2 } from "@freon4dsl/core";
	import { ALT, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, BACKSPACE, CONTROL, DELETE, ENTER, ESCAPE, SHIFT, TAB } from "@freon4dsl/core";

	import Editor from '@tinymce/tinymce-svelte';
	import type { TinyMCE as TinyMCEEditor, Editor as TinyEditor } from 'tinymce';

	import { runInAction } from "mobx";

	// Probably needed to code/encode HTML inside <TextArea>
	// import { replaceHTML } from "./svelte-utils/index.js";

	// TODO find out better way to handle muting/unmuting of LOGGERs
    const LOGGER = new FreLogger("MultiLineTextComponent2"); // .mute(); muting done through webapp/logging/LoggerSettings
    type BoxType = "text";

    // Parameters
    export let editor: FreEditor;	
	export let box: MultiLineTextBox2;		// the accompanying box
    export let text: string;    			// the text to be displayed, needs to be exported for to use 'bind:text' in TextDropdownComponent
	export let isEditing: boolean = false;

    // Local variables
    let id: string;                         // an id for the html element
    id = !!box ? componentId(box) : 'text-with-unknown-box';
    let spanElement: HTMLSpanElement;       // the <span> element on the screen
    let editorElement: TinyMCEEditor;
	let editorContainer: HTMLDivElement; 		// the text area element on the screen
	let from = -1;							// the cursor position, or when different from 'to', the start of the selected text
    let to = -1;
	let cssClass: string;
	let boxType: BoxType = "text";  
	let ed: TinyEditor;

	let placeholder: string = '<..>';       // the placeholder when value of text component is not present
	let placeHolderStyle: string;
	$: placeHolderStyle = "placeholder";

	let conf = {
		plugins: 'lists searchreplace',
		toolbar: 'undo redo | bold italic underline \
		| fontfamily fontsize \
		| forecolor backcolor \
		| alignleft aligncenter alignright \
		| bullist numlist outdent indent | searchreplace',
		toolbar_mode: 'wrap',
		skin: 'oxide-dark',
		menubar: false,
 	}

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
	
        const element = document.getElementById(id);
        if (element) {
            // Traverse up to find the nearest parent with the 'render-component' class
            let parent = element.parentElement;
            while (parent && !parent.classList.contains('render-component')) {
                parent = parent.parentElement;
            }
            // If a parent with the 'render-component' class was found, apply styles to it
            if (parent) {
                // Example: Apply additional styles here
                parent.style.width = '100%'; // Example style
            }
        }	
	});

	/**
	 */
	afterUpdate(() => {
		placeholder = box.placeHolder;
		box.setFocus = setFocus;
		box.refreshComponent = refresh;
	});

	/**
     * This function sets the focus on this element programmatically.
     * It is called from the box.
     */
	export async function setFocus(): Promise<void> {
		LOGGER.log("setFocus "+ id);
		isEditing = true;

		if (ed) {
			setCaret();
		}

	}

    /**
     * This function ensures that 'from <= to' always holds.
     * Should be called whenever these variables are set.
     * @param inFrom
     * @param inTo
     */
	 function setFromAndTo(inFrom: number, inTo: number) {
        if (inFrom < inTo) {
            from = inFrom;
            to = inTo;
        } else {
            from = inTo;
            to = inFrom;
        }
    }

	function setCaret() {
		LOGGER.log(`setCaret from: ${from} to: ${to}` );
 
		//LOGGER.log(`setCaret ${freCaret.position} [${freCaret.from}, ${freCaret.to}]` );
        // switch (freCaret.position) {
        //     case FreCaretPosition.RIGHT_MOST:  // type nr 2
        //         from = to = text.length;
        //         break;
        //     case FreCaretPosition.LEFT_MOST:   // type nr 1
        //     case FreCaretPosition.UNSPECIFIED: // type nr 0
        //         from = to = 0;
        //         break;
        //     case FreCaretPosition.INDEX:       // type nr 3
		// 		setFromAndTo(freCaret.from, freCaret.to);
		// 		break;
        //     default:
		// 		from = to = 0;
        //         break;
        // }
        if (isEditing) {
			ed.focus();
			ed.selection.setCursorLocation();
        }
    }

	//1
    function startEditing(event: MouseEvent) {
        LOGGER.log('edlc: startEditing ' + id);
        // set the global selection
        editor.selectElementForBox(box);
        // set the local variables
        isEditing = true;

        let {anchorOffset, focusOffset} = document.getSelection();
		setFromAndTo(anchorOffset, focusOffset);
	    event.preventDefault();
        event.stopPropagation();
		setCaret();
    }

    /**
     * When the <input> element loses focus the function is called. It switches the display back to
     * the <span> element, and stores the current text in the textbox.
     */
    function endEditing() {

        LOGGER.log('edlc:  endEditing ' + id);
		if (isEditing) {
			// reset the local variables
			isEditing = false;
			from = -1;
			to = -1;

			// // store the current value in the textbox, or delete the box, if appropriate
			// LOGGER.log(`   save text using box.setText(${text})`)
			// runInAction(() => {
			// 	if (box.deleteWhenEmpty && text.length === 0) {
			// 		editor.deleteBox(box);
			// 	} else if (text !== box.getText()) {
			// 		LOGGER.log(`   text is new value`)
			// 		box.setText(text);
			// 	}
			// });

		}
    }

	function onEditorInit(event: CustomEvent) {
		LOGGER.log('edlc: onEditorInit ' + id);
		ed = event.detail.editor;
		event.preventDefault();
        event.stopPropagation();
	}

	function onEditorFocus(event: CustomEvent) {
		LOGGER.log('edlc: onEditorFocus ' + id);
		event.preventDefault();
        event.stopPropagation();
	}

	 function onEditorFocusOut(event: CustomEvent) {
		LOGGER.log('edlc: onEditorFocusOut ' + id);
		runInAction(() => {
			if (text !== box.getText()) {
				LOGGER.log(`   text is new value`)
				box.setText(text);
			} else {
				LOGGER.log("Text is unchanged: " + text)
			}
		});
	}

	/**
     * When this loose focus from editor
     */
	function onEditorBlur(event: CustomEvent) {
		LOGGER.log('edlc: onEditorBlur ' + id);
		endEditing();
		event.preventDefault();
        event.stopPropagation();
	}

	function onEditorContainerKeyDown(event: KeyboardEvent) {
		
		const key:string = event.key;
		const alt:boolean = event.altKey;
		const shift:boolean = event.shiftKey;
		const ctrl:boolean = event.ctrlKey;
		const meta:boolean = event.metaKey;

        LOGGER.log("onKeyDown: [" + key + "] alt [" + alt + "] shift [" + shift + "] ctrl [" + ctrl + "] meta [" + meta + "]");
		switch (key) {
			case TAB: {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();
				endEditing();
				if (shift) {
					editor.selectPreviousLeaf();
				} else {
					editor.selectNextLeaf();
				}
				break; }
			default: {
				event.stopPropagation();
			}
		}
	}

	const refresh = () => {
		LOGGER.log("REFRESH " + box?.element?.freId() + " (" + box?.element?.freLanguageConcept() + ")")
		placeholder = box.placeHolder;
		text = box.getText();
	}

	refresh();

</script>

<span id="{id}" role="none" class="{cssClass} w-full">
	<div bind:this={editorContainer} role="none" class="multiline-editor {isEditing ? 'visible' : 'hidden'} w-full" on:keydown={onEditorContainerKeyDown}>
		<Editor 
			licenseKey='gpl'
			bind:this={editorElement}
			bind:value={text} 
			scriptSrc='./tinymce/tinymce.min.js'
			inline={true}
			on:init={onEditorInit}
			on:blur={onEditorBlur}
			on:focusout={onEditorFocusOut}
			{conf}
		/>
	</div>
	<span id="{id}-span"
		class="{box.role} text-box-{boxType} multiline-text {isEditing ? 'hidden' : 'visible'}"
		on:click={startEditing}
		bind:this={spanElement}
		contenteditable=true
		spellcheck=false
		role="none">
		{#if !!text && text.length > 0}
			{@html text}
		{:else}
			<span class="{placeHolderStyle}">{placeholder}</span>
		{/if}
	</span>
</span>

<style>
	.hidden {
		display: none;
	}
	.visible {
		display: block; /* Or whatever display type the editor should have */
	}
</style>
