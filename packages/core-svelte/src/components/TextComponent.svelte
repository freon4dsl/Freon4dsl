<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->
<!-- Also, in order to make the <input> resizable , it is wrapped into -->
<!-- its own <span> that gets a handle to actually resize it. -->

<script lang="ts">
	import { afterUpdate, onMount } from "svelte";
	import {
		AliasBox,
		KEY_ALT, KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP, KEY_BACKSPACE,
		KEY_CONTROL, KEY_DELETE, KEY_ENTER, KEY_ESCAPE,
		KEY_SHIFT, KEY_SPACEBAR, KEY_TAB,
		PiCaret,
		PiCaretPosition,
		PiEditor,
		PiLogger, SelectBox,
		TextBox
	} from "@projectit/core";
    import { componentId } from "./util";
	import { autorun, runInAction } from "mobx";
	import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER } from "./ChangeNotifier";
	import { setBoxSizes } from "./setBoxSizes";

    const LOGGER = new PiLogger("TextComponent").mute();
    type BoxType = "alias" | "select" | "text"; // TODO question: is 'select' still an option?

    // Parameters
    export let isEditing: boolean = false; 	// indication whether this component is currently being edited by the user
    export let textBox: TextBox;			// the accompanying textbox
    export let editor: PiEditor;			// the editor

    // Local variables
    let id: string = componentId(textBox);
    let text: string = textBox.getText();   // the text to be displayed
    let spanElement: HTMLSpanElement;       // the <span> element on the screen
	let inputHTMLelement: HTMLInputElement; // the <input> element on the screen
	let placeholder: string;                // the placeholder when value of text component is not present
    let originalText: string;               // variable to remember the text that was in the box previously
    let boxType: BoxType = "text";          // indication how is this text component used
	let editStart = false;					// indicates whether we are just starting to edit, so we need to set the cursor in the <input>
	let size = 10;							// the size of the <input>
	let from = -1;							// the cursor position, or when different from 'to', the start of the selected text
	let to = -1;							// the cursor position, or when different from 'from', the end of the selected text
											// Note that 'from <= to' always holds.

	// Exported functions
	export const setFocus = () => {
		// TODO should we check here whether the box is selectable? If so, where else is this check needed?
		LOGGER.log("setFocus " + ": box[" + textBox.role + ", " + textBox.caretPosition + "]");
		// FOCUS_LOGGER.log("setFocus " + ": box[" + textBox.role + ", " + textBox.caretPosition + "]");
		if (document.activeElement === inputHTMLelement || isEditing ) {
			FOCUS_LOGGER.log("    has focus already");
			return;
		}
		// set the local variables, but do not set 'from' and 'to'
		// we assume they are set programmatically before or after the call to this function
		isEditing = true;
		editStart = true;
		originalText = text;
		size = text.length == 0 ? 10 : text.length;
		// inputHTMLelement.focus(); is done by afterUpdate()
	};

	/**
	 * When the switch is made from <span> to <input> this function is called.
	 * It stores the caret position(s) to be used to set the selection of the <input>,
	 * and sets the selectedBox of the editor.
	 */
    function startEditing(event: MouseEvent) {
		LOGGER.log('startEditing');
		if (textBox.selectable) {
			isEditing = true;
			editStart = true;
			originalText = text;
			size = text.length == 0 ? 10 : text.length + 5;
			let {
				anchorNode, anchorOffset, focusNode, focusOffset
			} = document.getSelection();
			from = anchorOffset;
			to = focusOffset;

			LOGGER.log("       ===> selected box " + textBox.role);
			editor.selectedBox = textBox;
			event.preventDefault();
			event.stopPropagation();
		}
	}

	/**
	 * When the <input> element is shown, the clicks should not be propagated.
	 * (Clicks either resize the element or set the caret position.)
	 * @param event
	 */
	function onClick(event: MouseEvent) {
		LOGGER.log('onClick while Editing');
		if (isEditing) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
	/**
	 * When the <input> element loses focus the fucntion is called. It switches the display back to
	 * the <span> element, and stores the current text in the textbox.
	 */
    function endEditing() {
		// reset the local variables
        isEditing = false;
        from = -1;
        to = -1;
		// store the current value in the textbox, or delete the box, if appropriate
		runInAction(() => {
			if (textBox.deleteWhenEmpty && text.length === 0) {
				editor.deleteBox(textBox);
			} else if (text !== originalText) {
				textBox.setText(text);
			}
		});
    }

	/**
	 * When a keyboard event is triggered, this function stores the caret position(s).
	 * Note, this function is to be used from the <input> element only. It depends on the
	 * fact that the event target has a 'selectionStart' and a 'selectionEnd', which is the case
	 * only for <textarea> or <input> elements.
	 * @param event
	 */
    function getCaretPosition(event: KeyboardEvent) {
		// the following type cast satisfies the type checking, as the event can only be generated from the <input> element
		const target = event.target as HTMLInputElement;
		if (target.selectionEnd < target.selectionStart) {
			from = target.selectionEnd;
			to = target.selectionStart;
		} else {
			from = target.selectionStart;
			to = target.selectionEnd;
		}
    }

	/**
	 * This function sets the caret position of the <input> element programmatically.
	 * @param piCaret
	 */
	const setCaret = (piCaret: PiCaret) => {
		LOGGER.log("setCaretPosition");
		switch (piCaret.position) {
			case PiCaretPosition.RIGHT_MOST:
				from = to = text.length;
				break;
			case PiCaretPosition.LEFT_MOST:
				from = to = 0;
				break;
			case PiCaretPosition.INDEX:
				from = to = piCaret.index;
				break;
			case PiCaretPosition.UNSPECIFIED:
				break;
			default:
				break;
		}
		if (isEditing) {
			inputHTMLelement.selectionStart = from >= 0 ? from : 0;
			inputHTMLelement.selectionEnd = to >= 0 ? to : 0;
			inputHTMLelement.focus();
		}
	};

	/**
	 * This function handles any keyboard event that occurs within the <input> element.
	 * @param event
	 */
    const onKeypress = (event: KeyboardEvent) => {
		// see https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts
		// stopPropagation on an element will stop that event from happening on the parent (the entire ancestors),
		// preventDefault on an element will stop the event on the element, but it will happen on it's parent (and the ancestors too!)
		switch (event.key) {
			case KEY_ALT: { // not relevant if entered separately
				break;
			}
			case KEY_CONTROL: { // not relevant if entered separately
				break;
			}
			case KEY_SHIFT: { // not relevant if entered separately
				break;
			}
			case KEY_ARROW_DOWN: {
				endEditing();
				break;
			}
			case KEY_ARROW_LEFT: {
				getCaretPosition(event);
				LOGGER.log("Caret at: " + from);
				if (from !== 0) { // when the arrow key can stay within the text, do not let the parent handle it
					event.stopPropagation();
				} else { // the key will cause this element to lose focus, its content should be saved
					endEditing();
				}
				break;
			}
			case KEY_ARROW_RIGHT: {
				getCaretPosition(event);
				LOGGER.log("Caret at: " + from);
				if (from !== text.length) { // when the arrow key can stay within the text, do not let the parent handle it
					event.stopPropagation();
				} else { // the key will cause this element to lose focus, its content should be saved
					endEditing();
				}
				break;
			}
			case KEY_ARROW_UP: {
				endEditing();
				break;
			}
			case KEY_BACKSPACE: {
				if (!event.ctrlKey && event.altKey && !event.shiftKey) { // alt-backspace
					// TODO UNDO
				} else if (!event.ctrlKey && event.altKey && event.shiftKey) { // alt-shift-backspace
					// TODO REDO
				} else {
					getCaretPosition(event);
					LOGGER.log("Caret at: " + from);
					if (from !== 0) { // when there are still chars remaining to the left, do not let the parent handle it
						// without propagation, the browser handles which char(s) to be deleted
						// with event.ctrlKey: delete text from caret to end => handled by browser
						event.stopPropagation();
					} else if (text === "" || !!text) {
						if (textBox.deleteWhenEmptyAndErase) {
							editor.deleteBox(editor.selectedBox);
							event.stopPropagation();
							return;
						}
					} else { // TODO nothing left in this component to delete, what should happen?
						// the key will cause this element to lose focus, its content should be saved
						endEditing();
					}
				}
				break;
			}
			case KEY_DELETE: {
				if (!event.ctrlKey && !event.altKey && event.shiftKey) { // shift-delete
					// CUT
				} else {
					getCaretPosition(event);
					if (to !== text.length) { // when there are still chars remaining to the right, do not let the parent handle it
						// without propagation, the browser handles which char(s) to be deleted
						// with event.ctrlKey: delete text from caret to 0 => handled by browser
						event.stopPropagation();
					} else if (text === "" || !!text) {
						if (textBox.deleteWhenEmptyAndErase) {
							editor.deleteBox(editor.selectedBox);
							event.stopPropagation();
							return;
						}
					} else { // TODO nothing left in this component to delete, what should happen?
						// the key will cause this element to lose focus, its content should be saved
						endEditing();
					}
					break;
				}
			}
			case KEY_SPACEBAR: { // ignore any spaces in the text
				event.stopPropagation();
				event.preventDefault();
				break;
			}
			case KEY_ENTER: {
				LOGGER.log("Enter pressed");
				endEditing();
				event.preventDefault();
				event.stopPropagation();
				break;
			}
				// TODO: should the following keys do something?
			case KEY_ESCAPE: {
				break;
			}
			case KEY_TAB: {
				break;
			}
			default: {
				if (event.ctrlKey && !event.altKey && event.key === 'z') {
					// UNDO handled by browser
				}
				if (event.ctrlKey && event.altKey && event.key === 'z' || !event.ctrlKey && event.altKey && event.key === KEY_BACKSPACE) {
					// REDO handled by browser
				}
				if (event.ctrlKey && !event.altKey && event.key === 'h') {
					// SEARCH
					event.stopPropagation();
				}
				if (event.ctrlKey && !event.altKey && event.key === 'x') {
					// CUT
					event.stopPropagation();
				}
				if (event.ctrlKey && !event.altKey && event.key === 'c') {
					// COPY
					event.stopPropagation();
					navigator.clipboard.writeText(text) // TODO get only the selected text from document.getSelection
							.then(() => {
								alert('Text copied to clipboard');
							})
							.catch(err => {
								alert('Error in copying text: ' + err.message);
							});
				}
				if (event.ctrlKey && !event.altKey && event.key === 'v') {
					// PASTE
					event.stopPropagation();
					event.preventDefault(); // the default event causes extra <span> elements to be added

					// clipboard.readText does not work in Firefox
					// Firefox only supports reading the clipboard in browser extensions, using the "clipboardRead" extension permission.
					// TODO add a check on the browser used
					navigator.clipboard.readText().then(
							clipText => LOGGER.log('adding ' + clipText + ' after ' + text[to -1]));
					// TODO add the clipText to 'text'
				}
				// all other keys are added to the text
			}
		}
    };

	/**
	 * When the HTML is updated, and the switch is made from <span> to <input>,
	 * this function sets the caret position(s) on the <input>.
	 * Note that 'from <= to' always holds.
	 */
	afterUpdate(() => {
		LOGGER.log("afterUpdate " + editStart);
		if (editStart) {
			inputHTMLelement.selectionStart = from >= 0 ? from : 0;
			inputHTMLelement.selectionEnd = to >= 0 ? to : 0;
			inputHTMLelement.focus();
			editStart = false;
		}
		if (!isEditing && !!spanElement) {
			setBoxSizes(textBox, spanElement.getBoundingClientRect());
		}
	});

	onMount(() => {
		LOGGER.log('onMount');
		MOUNT_LOGGER.log("TextComponent.onMount for role [" + textBox.role + "]");
		textBox.setFocus = setFocus;
		textBox.setCaret = setCaret;
		originalText = textBox.getText();
	});

	autorun(() => {
		LOGGER.log("autorun");
		AUTO_LOGGER.log("TextComponent role " + textBox.role + " text [" + text + "] textBox [" + textBox.getText() + "] innertText [" + spanElement?.innerText + "] isEditing [" + isEditing + "]");
		// TODO can the following five statements be moved to onMount()?
		placeholder = textBox.placeHolder;
		text = textBox.getText();
		boxType = (textBox.parent instanceof AliasBox ? "alias" : (textBox.parent instanceof SelectBox ? "select" : "text"));
		textBox.setFocus = setFocus;
		textBox.setCaret = setCaret;
	});

</script>

<span on:blur={endEditing} on:click={onClick}>
	{#if isEditing}
		<span class="resizable-input">
			<input type="text"
				   id="{id}-input"
				   bind:this={inputHTMLelement}
				   bind:value={text}
                   on:blur={endEditing}
                   on:keydown={onKeypress}
				   size={size}
				   placeholder="{placeholder}"/>
		</span>
	{:else}
		<span class="{textBox.role} text-box-{boxType} text"
			  on:click={startEditing}
			  bind:this={spanElement}
			  id="{id}">
			{#if !!text && text.length > 0}
				{text}
			{:else}
				{placeholder}
			{/if}
		</span>
	{/if}
</span>

<style>
    .resizable-input {
        /* make resizable */
        overflow-x: hidden;
        resize: horizontal;
        display: inline-block;

        /* no extra spaces */
        padding: 0;
        margin-bottom: -5px;
        white-space: nowrap;

        /* default widths */
        min-width: 2em;
        max-width: 30em;
    }
    /* let <input> assume the size of the wrapper */
    .resizable-input > input {
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        border: none;
		background-color: var(--freon-selected-background-color, rgba(211, 227, 253, 255));
		outline-color: var(--freon-selected-outline-color, darkblue);
		outline-style: var(--freon-selected-outline-style, solid);
		outline-width: var(--freon-selected-outline-width, 1px);
		font-family: var(--freon-text-component-font-family, "Arial");
		font-size: var(--freon-text-component-font-size, 14pt);
		font-weight: var(--freon-text-component-font-weight, inherit);
		font-style: var(--freon-text-component-font-style, inherit);
    }
    /* add a visible handle */
    .resizable-input::after {
        display: inline-block;
        vertical-align: bottom;
        margin-left: -16px;
        width: 16px;
        height: 16px;
        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAJUlEQVR4AcXJRwEAIBAAIPuXxgiOW3xZYzi1Q3Nqh+bUDk1yD9sQaUG/4ehuEAAAAABJRU5ErkJggg==");
        cursor: ew-resize;
    }
	.text {
		/*content: attr(data-placeholdertext);*/
		color: var(--freon-text-component-color, blue);
		background-color: var(--freon-text-component-background-color, inherit);
		font-family: var(--freon-text-component-font-family, "Arial");
		font-size: var(--freon-text-component-font-size, 14pt);
		font-weight: var(--freon-text-component-font-weight, inherit);
		font-style: var(--freon-text-component-font-style, inherit);
		padding: var(--freon-text-component-padding, 1px);
		margin: var(--freon-text-component-margin, 1px);
		white-space: normal;
		display: inline-block;
	}
</style>
