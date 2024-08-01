<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->

<script lang="ts">
	import { afterUpdate, beforeUpdate, createEventDispatcher, onMount } from "svelte";
	import { componentId, executeCustomKeyboardShortCut, setBoxSizes } from "./svelte-utils/index.js";
	import {
		ActionBox,
		ALT,
		ARROW_DOWN,
		ARROW_LEFT,
		ARROW_RIGHT,
		ARROW_UP,
		BACKSPACE,
		CharAllowed,
		CONTROL,
		DELETE,
		ENTER,
		ESCAPE,
		isActionBox,
		isActionTextBox,
		isSelectBox,
		FreCaret,
		FreCaretPosition,
		FreEditor,
		FreLogger,
		SelectBox,
		FreErrorSeverity,
		SHIFT,
		TAB,
		TextBox, isRegExp, triggerTypeToString, type FrePostAction
	} from "@freon4dsl/core";

	import { runInAction } from "mobx";
	import { replaceHTML } from "./svelte-utils/index.js";

	// TODO find out better way to handle muting/unmuting of LOGGERs
    const LOGGER = new FreLogger("TextComponent"); // .mute(); muting done through webapp/logging/LoggerSettings
    const dispatcher = createEventDispatcher();
    type BoxType = "action" | "select" | "text";

    // Parameters
    export let box: TextBox;				// the accompanying textbox
    export let editor: FreEditor;			// the editor
	export let isEditing: boolean = false; 	// indication whether this component is currently being edited by the user, needs to be exported for binding in TextDropdownComponent
	export let partOfActionBox: boolean = false; // indication whether this text component is part of an TextDropdownComponent
	export let text: string;    			// the text to be displayed, needs to be exported for to use 'bind:text' in TextDropdownComponent

	export let textUpdateFunction = undefined
	export let endEditingParentFunction = undefined
    // Local variables
    let id: string;                         // an id for the html element
    id = !!box ? componentId(box) : 'text-with-unknown-box';
    let inputElement: HTMLInputElement; 	// the <input> element on the screen
    let placeholder: string = '<..>';       // the placeholder when value of text component is not present
    let originalText: string;               // variable to remember the text that was in the box previously
    let editStart = false;					// indicates whether we are just starting to edit, so we need to set the cursor in the <input>
    let from = -1;							// the cursor position, or when different from 'to', the start of the selected text
    let to = -1;							// the cursor position, or when different from 'from', the end of the selected text
    										// Note that 'from <= to' always holds.
	let placeHolderStyle: string;
	$: placeHolderStyle = (partOfActionBox ? "actionPlaceholder" : "placeholder");
    let boxType: BoxType = "text";          // indication how is this text component is used, determines styling
    $: boxType = !!box.parent ? (isActionBox(box?.parent) ? "action" : isSelectBox(box?.parent) ? "select" : "text") : "text";

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box.
     */
	export async function setFocus(): Promise<void> {
		// LOGGER.log("setFocus "+ id + " input is there: " + !!inputElement);
		if (!!inputElement) {
			inputElement.focus();
		} else {
			// set the local variables, then the inputElement will be shown
			isEditing = true;
			editStart = true;
			originalText = text;
			setCaret(editor.selectedCaretPosition);
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

    /**
     * This function sets the caret position of the <input> element programmatically.
     * It is called from setFocus, so indirectly by the editor.
     * @param freCaret
     */
    const setCaret = (freCaret: FreCaret) => {
		LOGGER.log(`setCaret ${freCaret.position} [${freCaret.from}, ${freCaret.to}]` );
        switch (freCaret.position) {
            case FreCaretPosition.RIGHT_MOST:  // type nr 2
                from = to = text.length;
                break;
            case FreCaretPosition.LEFT_MOST:   // type nr 1
            case FreCaretPosition.UNSPECIFIED: // type nr 0
                from = to = 0;
                break;
            case FreCaretPosition.INDEX:       // type nr 3
				setFromAndTo(freCaret.from, freCaret.to);
				break;
            default:
				from = to = 0;
                break;
        }
        if (isEditing && !!inputElement) {
			inputElement.selectionStart = from >= 0 ? from : 0;
            inputElement.selectionEnd = to >= 0 ? to : 0;
            inputElement.focus();
        }
    };

    /**
     * When the switch is made from <span> to <input> this function is called.
     * It stores the caret position(s) to be used to set the selection of the <input>,
     * and sets the selectedBox of the editor.
     */
    function startEditing(event: MouseEvent) {
        LOGGER.log('startEditing ' + id);
        // set the global selection
        editor.selectElementForBox(box);
        // set the local variables
        isEditing = true;
        editStart = true;
        originalText = text;
        let {anchorOffset, focusOffset} = document.getSelection();
		setFromAndTo(anchorOffset, focusOffset);
	    event.preventDefault();
        event.stopPropagation();
        dispatcher('startEditing', {content: text, caret: from}); // tell the TextDropdown that the edit has started
    }

    /**
     * This function is only called when the <input> element is shown. Then clicks should not be propagated.
     * (Clicks either resize the element or set the caret position.)
     * When this component is part of a TextDropdown Component, the dropdown options should also be altered.
     * @param event
     */
    function onClick(event: MouseEvent) {
		if (!!inputElement) {
			LOGGER.log('onClick: ' + id + ', ' + inputElement?.selectionStart + ", " + inputElement?.selectionEnd);
			setFromAndTo(inputElement.selectionStart, inputElement.selectionEnd);
		}
		if (partOfActionBox) {  // let TextDropdownComponent know, dropdown menu needs to be altered
            LOGGER.log('dispatching from on click');
			textUpdateFunction({content: text, caret: from})
            // dispatcher('textUpdate', {content: text, caret: from});
        }
        event.stopPropagation();
    }

    /**
     * When the <input> element loses focus the function is called. It switches the display back to
     * the <span> element, and stores the current text in the textbox.
     */
    function endEditing() {
        LOGGER.log(`${id}:  endEditing text is '${text}'` );
		if (isEditing) {
			// reset the local variables
			isEditing = false;
			from = -1;
			to = -1;

			if (!partOfActionBox) {
				// store the current value in the textbox, or delete the box, if appropriate
				LOGGER.log(`   save text using box.setText(${text})`)
				runInAction(() => {
					if (box.deleteWhenEmpty && text.length === 0) {
						editor.deleteBox(box);
					} else if (text !== box.getText()) {
						LOGGER.log(`   text is new value`)
						box.setText(text);
					}
				});
			} else {
				if (!!endEditingParentFunction) {
					endEditingParentFunction();
				} else {
					LOGGER.error("No parent endEditing function")
				}
			}
		}
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
        setFromAndTo(target.selectionStart, target.selectionEnd);
    }

    /**
     * This function handles any keyboard event that occurs within the <input> element.
     * Note, we use onKeyDown, because onKeyPress is deprecated.
     * @param event
     */
    const onKeyDown = (event: KeyboardEvent) => {
        // see https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts
        // stopPropagation on an element will stop that event from happening on the parent (the entire ancestors),
        // preventDefault on an element will stop the event on the element, but it will happen on it's parent (and the ancestors too!)
        LOGGER.log("onKeyDown: [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "] meta [" + event.metaKey + "]");

		if (event.altKey || event.ctrlKey) {  // No shift, because that is handled as normal text
			// first check if this event has a command defined for it
			executeCustomKeyboardShortCut(event, 0, box, editor); // this method will stop the event from propagating, but does not prevent default!!
			// next handle any key that should have a special effect within the text
			if (event.ctrlKey && !event.altKey && event.key === 'z') { // ctrl-z
				// UNDO handled by browser
			} else if (event.ctrlKey && event.altKey && event.key === 'z' || !event.ctrlKey && event.altKey && event.key === BACKSPACE) { // ctrl-alt-z or alt-backspace
				// REDO handled by browser
			} else if (event.ctrlKey && !event.altKey && event.key === 'h') { // ctrl-h
				// SEARCH
				event.stopPropagation();
			} else if (event.ctrlKey && !event.altKey && event.key === 'x') { // ctrl-x
				// CUT
				event.stopPropagation();
			} else if (event.ctrlKey && !event.altKey && event.key === 'c') { // ctrl-c
				// COPY
				event.stopPropagation();
				navigator.clipboard.writeText(text) // TODO get only the selected text from document.getSelection
						.then(() => {
							editor.setUserMessage('Text copied to clipboard', FreErrorSeverity.Info);
						})
						.catch(err => {
							editor.setUserMessage('Error in copying text: ' + err.message);
						});
			} else if (event.ctrlKey && !event.altKey && event.key === 'v') { // ctrl-v
				// PASTE
				event.stopPropagation();
				event.preventDefault(); // the default event causes extra <span> elements to be added

				// clipboard.readText does not work in Firefox
				// Firefox only supports reading the clipboard in browser extensions, using the "clipboardRead" extension permission.
				// TODO add a check on the browser used
				// navigator.clipboard.readText().then(
				// 		clipText => LOGGER.log('adding ' + clipText + ' after ' + text[to - 1]));
				// TODO add the clipText to 'text'
			} else if (event.key === SHIFT || event.key === CONTROL || event.key === ALT) { // ignore meta keys
				LOGGER.log("SHIFT: stop propagation")
				event.stopPropagation();
			}
		} else { // handle non meta keys
			switch (event.key) {
				case ARROW_DOWN:
				case ARROW_UP:
				case ENTER:
				case ESCAPE:
				case TAB: {
					// todo Maybe this option could be completely handled by TextDropDown and Freon,
					// this would avoid a second call to endEditing when the selection is changed.
					LOGGER.log("Arrow up, arrow down, enter, escape, or tab pressed: " + event.key);
					if (!partOfActionBox && isEditing) {
						endEditing();
						// do not switch selection, this will be done by FreonComponent
					} // else, let TextDropDownComponent handle this
					break;
				}
				case ARROW_LEFT: {
					getCaretPosition(event);
					LOGGER.log("Arrow-left: Caret at: " + from);
					if (from !== 0) { // when the arrow key can stay within the text, do not let the parent handle it
						event.stopPropagation();
						// note: caret is set to one less because getCaretPosition is calculated before the event is executed
						LOGGER.log('dispatching from arrow-left')
						dispatcher('textUpdate', {content: text, caret: from - 1});
					} else { // the key will cause this element to lose focus, its content should be saved
						endEditing();
						// let the parent take care of handling the event
					}
					break;
				}
				case ARROW_RIGHT: {
					getCaretPosition(event);
					LOGGER.log("Arrow-right: Caret at: " + from);
					if (from !== text.length) { // when the arrow key can stay within the text, do not let the parent handle it
						event.stopPropagation();
						// note: caret is set to one more because getCaretPosition is calculated before the event is executed
						LOGGER.log('dispatching from arrow-right')
						dispatcher('textUpdate', {content: text, caret: from + 1});
					} else { // the key will cause this element to lose focus, its content should be saved
						endEditing();
						// let the parent take care of handling the event
					}
					break;
				}
				case BACKSPACE: {
					if (!event.ctrlKey && event.altKey && !event.shiftKey) { // alt-backspace
						// TODO UNDO
					} else if (!event.ctrlKey && event.altKey && event.shiftKey) { // alt-shift-backspace
						// TODO REDO
					} else { // backspace
						getCaretPosition(event);
						LOGGER.log("Caret at: " + from);
						if (from !== 0) { // When there are still chars remaining to the left, do not let the parent handle it.
							// Without propagation, the browser handles which char(s) to be deleted.
							// With event.ctrlKey: delete text from caret to end => handled by browser.
							event.stopPropagation();
						} else if (text === "" || !!text) { // nothing left in this component to delete
							if (box.deleteWhenEmptyAndErase) {
								editor.deleteBox(box);
								event.stopPropagation();
								return;
							}
							editor.selectPreviousLeaf();
						} else {
							// the key will cause this element to lose focus, its content should be saved
							endEditing();
							editor.selectPreviousLeaf();
						}
					}
					break;
				}
				case DELETE: {
					if (!event.ctrlKey && !event.altKey && event.shiftKey) { // shift-delete
						// CUT
					} else { // delete
						event.stopPropagation();
						getCaretPosition(event);
						if (to !== text.length) { // when there are still chars remaining to the right, do not let the parent handle it
							// without propagation, the browser handles which char(s) to be deleted
							// with event.ctrlKey: delete text from caret to 0 => handled by browser
							event.stopPropagation();
						} else if (text === "" || !text) { //  nothing left in this component to delete
							if (box.deleteWhenEmptyAndErase) {
								editor.deleteBox(box);
								return;
							} else { // TODO is this correct?
								// the key will cause this element to lose focus, its content should be saved
								endEditing();
								editor.selectNextLeaf();
							}
						}
					}
					break;
				}
				default: { // the event.key is SHIFT or a printable character
					getCaretPosition(event);
					if (event.shiftKey && event.key === "Shift") {
						// shift key pressed, ignore
						event.stopPropagation();
						break
					}
					switch (box.isCharAllowed(text, event.key, from)) {
						case CharAllowed.OK: // add to text, handled by browser
							LOGGER.log('CharAllowed ' + JSON.stringify(event.key));
							// afterUpdate handles the dispatch of the textUpdate to the TextDropdown Component, if needed
							if (editor.selectedBox.kind === "ActionBox") {
								LOGGER.log(`${id}: TEXT UPDATE text '${text}' key: '${event.key}' from: ${from}`)

								if (textUpdateFunction !== undefined) {
									LOGGER.log(`${id}: TRY TO MATCH text `)
									const executed = textUpdateFunction({content: text.concat(event.key), caret: from + 1})
										LOGGER.log("Executed is " + executed)
									if (executed) {
										LOGGER.log("Stop propagation and preventDefault in onKeyDown")
										event.stopPropagation()
										event.preventDefault()
									}
								} else {
									LOGGER.log(`${id} no textupdatefunction`)
								}
								// dispatcher('textUpdate', {content: text.concat(event.key), caret: from - 1});
							}
							event.stopPropagation()
							break;
						case CharAllowed.NOT_OK: // ignore
							// ignore any spaces in the text TODO make this depend on textbox.spaceAllowed
							LOGGER.log("KeyPressAction.NOT_OK");
							event.preventDefault();
							event.stopPropagation();
							break;
						case CharAllowed.GOTO_NEXT: // try in previous or next box
							LOGGER.log("KeyPressAction.GOTO_NEXT FROM IS " + from);
							editor.selectNextLeaf();
							LOGGER.log("    NEXT LEAF IS " + editor.selectedBox.role);
							if (isActionBox(editor.selectedBox)) {
								LOGGER.log("     is an action box");
								editor.selectedBox.triggerKeyPressEvent(event.key);
								editor.selectedBox.setCaret(FreCaret.RIGHT_MOST)
							}
							event.preventDefault();
							event.stopPropagation();
							break;
						case CharAllowed.GOTO_PREVIOUS: // try in previous or next box
							LOGGER.log("KeyPressAction.GOTO_PREVIOUS FROM IS " + from);
							editor.selectPreviousLeaf();
							LOGGER.log("    PREVIOUS LEAF IS " + editor.selectedBox.role);
							if (isActionBox(editor.selectedBox)) {
								LOGGER.log("     is an action box");
								editor.selectedBox.triggerKeyPressEvent(event.key);
								editor.selectedBox.setCaret(FreCaret.RIGHT_MOST)
							}
							event.preventDefault();
							event.stopPropagation();
							break;
					}
				}
			}
		}
    };

    /**
     * When this component loses focus, do everything that is needed to end the editing state.
     */
	const onFocusOut = (e) => {
		LOGGER.log(`${id}: onFocusOut `+ " partof:" + partOfActionBox + " isEditing:" + isEditing)
		if (!partOfActionBox && isEditing) {
			endEditing();
		} else {
			// let TextDropdownComponent handle it
			dispatcher("onFocusOutText")
		}
	}

	const refresh = () => {
		LOGGER.log(`${id}: REFRESH  ${id} (${box?.element?.freLanguageConcept()}) boxtext '${box.getText()}' text '${text}'`)
		placeholder = box.placeHolder;
		// If being edited, do not set the value, let the user type whatever (s)he wants
		// if (!isEditing) {
			text = box.getText();
		// }
		boxType = (box.parent instanceof ActionBox ? "action" : (box.parent instanceof SelectBox ? "select" : "text"));
		setInputWidth();
	}

	/**
	 * When setting the focus programmatically, the 'inputElement' variable is not immediately set.
	 * It may be null or undefined! Therefore, we need this check to set the focus.
 	 */
	beforeUpdate(() => {
		if (editStart && !!inputElement) {
			LOGGER.log(`${id}: Before update : ${inputElement}`);
			setInputWidth();
			inputElement.focus();
			editStart = false;
		}
	});

    /**
     * When the HTML is updated, and the switch is made from <span> to <input>,
     * this function sets the caret position(s) on the <input>.
     * Note that 'from <= to' always holds.
     * When the switch from <input> to <span> is made, this function sets the
     * box sizes in the textbox.
     */
    afterUpdate(() => {
        // LOGGER.log("Start afterUpdate  " + from + ", " + to + " id: " + id);
		if (editStart && !!inputElement) {
			LOGGER.log(`${id}:  editStart in afterupdate text '${text}' `)
            inputElement.selectionStart = from >= 0 ? from : 0;
            inputElement.selectionEnd = to >= 0 ? to : 0;
			// setInputWidth();
			inputElement.focus();
            editStart = false;
        }
        // if (isEditing && partOfActionBox) {
			// 	if (text !== originalText) {
				// send event to parent
				// LOGGER.log(`${id}: dispatching textUpdateFunction with text ` + text + ' from afterUpdate');
				// dispatcher('textUpdate', {content: text, caret: from + 1});
				// textUpdateFunction({content: text, caret: from + 1})
			// }
        // }
		// Always set the input width explicitly.
		setInputWidth();
		placeholder = box.placeHolder
		box.setFocus = setFocus;
		box.setCaret = setCaret;
		box.refreshComponent = refresh;
	});

    /**
     * When this component is mounted, the setFocus and setCaret functions are
     * made available to the textbox, and the 'text' and 'originalText' variables
     * are set.
     */
    onMount(() => {
        LOGGER.log("onMount" + " for element "  + box?.element?.freId() + " (" + box?.element?.freLanguageConcept() + ")" + " originaltext: '" + box.getText() + "'");
        originalText = text = box.getText();
		placeholder = box.placeHolder;
		setInputWidth();
		box.setFocus = setFocus;
		box.setCaret = setCaret;
		box.refreshComponent = refresh;
    });

	/**
	 * Sets the inputwidth to match the text inside.
	 * Copy text from <input> into the <span> with position = absolute and takes the rendered span width.
	 * See https://dev.to/matrixersp/how-to-make-an-input-field-grow-shrink-as-you-type-513l
	 */
	function setInputWidth() {
		if(!!widthSpan && !!inputElement) {
			let value = inputElement.value;
			if ((value !== undefined) && (value !== null) && (value.length === 0)) {
				value = placeholder;
				if (placeholder.length === 0) {
					value = " ";
				}
			}
			// Ensure that HTML tags in value are encoded, otherwise they will be seen as HTML.
			widthSpan.innerHTML = replaceHTML(value);
			const width = widthSpan.offsetWidth + "px";
			inputElement.style.width = width;
			// LOGGER.log("setInputWidth mirror [" + value + "] input [" + inputElement.value + "] placeholder [" + placeholder + "] w: " + width + " " + widthSpan.clientWidth + " for element "  + box?.element?.freId() + " (" + box?.element?.freLanguageConcept() + ")")
		} else {
			// LOGGER.log("SetInputWidth do nothing for element " + box?.element?.freId() + " (" + box?.element?.freLanguageConcept() + ") " + widthSpan + "::" + inputElement + "::" + spanElement);
		}
	}

	/**
	 * Often a TextComponent is part of a list, to prevent the list capturing the drag start event, (which should actually
	 * select (part of) the text in the input element), this function is defined.
	 * Note that if the input element is not defined as 'draggable="true"', this function will never be called.
	 * @param event
	 */
	function onDragStart(event) {
		LOGGER.log('on drag start');
		event.stopPropagation();
		event.preventDefault();
	}

	let widthSpan: HTMLSpanElement;

	function onInput(event: InputEvent & { currentTarget: HTMLInputElement }) {
		setInputWidth();
	}

	refresh();
</script>

<!-- todo there is a double selection here: two borders are showing -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
<span on:click={onClick} id="{id}" role="none">
	{#if isEditing}
		<span class="inputtext">
			<input type="text"
                   class="inputtext"
				   id="{id}-input"
                   bind:this={inputElement}
				   on:input={onInput}
                   bind:value={text}
                   on:focusout={onFocusOut}
                   on:keydown={onKeyDown}
				   draggable="true"
				   on:dragstart={onDragStart}
                   placeholder="{placeholder}"/>
			<span class="inputttext width" bind:this={widthSpan}></span>
		</span>
	{:else}
		<!-- contenteditable must be true, otherwise there is no cursor position in the span after a click,
		     But ... this is only a problem when this component is inside a draggable element (like List or table)
		-->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
		<span class="{box.role} text-box-{boxType} text"
              on:click={startEditing}
			  contenteditable=true
			  spellcheck=false
              id="{id}-span"
			  role="none">
			{#if !!text && text.length > 0}
				{text}
			{:else}
				<span class="{placeHolderStyle}">{placeholder}</span>
			{/if}
		</span>
	{/if}
</span>

<style>
	.width {
		position: absolute;
		left: -9999px;
		display: inline-block;
		line-height: 6px;
		margin: var(--freon-text-component-margin, 1px);
		border: none;
		box-sizing: border-box;
		padding: var(--freon-text-component-padding, 1px);
		font-family: var(--freon-text-component-font-family, "Arial");
		font-size: var(--freon-text-component-font-size, 14pt);
		font-weight: var(--freon-text-component-font-weight, inherit);
		font-style: var(--freon-text-component-font-style, inherit);
	}

    .inputtext {
        /* To set the height of the input element we must use padding and line-height properties. The height property does not function! */
		color: var(--freon-text-component-color, blue);
		padding: var(--freon-text-component-padding, 1px);
        line-height: 6px;
        width: 100%;
        box-sizing: border-box;
		margin: var(--freon-text-component-margin, 1px);
        border: none;
        background: var(--freon-selected-background-color, rgba(211, 227, 253, 255));
        font-family: var(--freon-text-component-font-family, "Arial");
        font-size: var(--freon-text-component-font-size, 14pt);
        font-weight: var(--freon-text-component-font-weight, inherit);
        font-style: var(--freon-text-component-font-style, inherit);
    }

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
    }

	.placeholder {
		color: var(--freon-text-component-placeholder-color, blue);
		background: var(--freon-text-component-background-color, inherit);
		font-family: var(--freon-text-component-font-family, "Arial");
		font-size: var(--freon-text-component-font-size, 14pt);
		font-weight: var(--freon-text-component-font-weight, inherit);
		font-style: var(--freon-text-component-font-style, inherit);
		padding: var(--freon-text-component-padding, 1px);
		margin: var(--freon-text-component-margin, 1px);
		white-space: normal;
		display: inline-block;
	}
	.actionPlaceholder {
		color: var(--freon-text-component-actionplaceholder-color, darkgrey);
		background: var(--freon-text-component-background-color, inherit);
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
