<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->
<!-- Also, in order to make the <input> resizable, it is wrapped into -->
<!-- its own <span> that gets a handle to actually resize it. -->

<script lang="ts">
	import { afterUpdate, onMount, createEventDispatcher, tick, beforeUpdate } from "svelte";
	import { setBoxSizes } from "./svelte-utils";
	import {
		ARROW_DOWN,
		ARROW_LEFT,
		ARROW_RIGHT,
		ARROW_UP,
		BACKSPACE,
		DELETE,
		ENTER,
		ESCAPE,
		TAB,
		isActionBox,
		isSelectBox,
		PiEditor,
		PiLogger,
		TextBox,
		CharAllowed,
		PiCaret,
		PiCaretPosition,
		ActionBox,
		isActionTextBox,
		SelectBox,
		isMetaKey,
		PiCommand,
		PiEditorUtil,
		toPiKey, PI_NULL_COMMAND, PiPostAction, SHIFT, CONTROL, ALT
	} from "@projectit/core";

    import { autorun, runInAction } from "mobx";
	import { selectedBoxes } from "./svelte-utils/DropAndSelectStore";

	// TODO finger out better way to handle muting/unmuting of LOGGERs
    const LOGGER = new PiLogger("TextComponent"); // .mute(); muting done through webapp/logging/LoggerSettings
    const dispatcher = createEventDispatcher();
    type BoxType = "alias" | "select" | "text";

    // Parameters
    export let box: TextBox;				// the accompanying textbox
    export let editor: PiEditor;			// the editor
	export let isEditing: boolean = false; 	// indication whether this component is currently being edited by the user, needs to be exported for binding in TextDropdownComponent
	export let partOfActionBox: boolean = false; // indication whether this text component is part of an TextDropdownComponent
	export let text: string;    			// the text to be displayed, needs to be exported for to use 'bind:text' in TextDropdownComponent

    // Local variables
    let id: string;                         // an id for the html element
    id = !!box ? box.id : 'text-with-unknown-box';
    let spanElement: HTMLSpanElement;       // the <span> element on the screen
    let inputElement: HTMLInputElement; 	// the <input> element on the screen
    let placeholder: string = '<..>';       // the placeholder when value of text component is not present
    let originalText: string;               // variable to remember the text that was in the box previously
    let editStart = false;					// indicates whether we are just starting to edit, so we need to set the cursor in the <input>
    let size = 10;							// the size of the <input>
    let from = -1;							// the cursor position, or when different from 'to', the start of the selected text
    let to = -1;							// the cursor position, or when different from 'from', the end of the selected text
    										// Note that 'from <= to' always holds.

    let boxType: BoxType = "text";          // indication how is this text component used, determines styling
    $: boxType = !!box.parent ? (isActionBox(box?.parent) ? "alias" : isSelectBox(box?.parent) ? "select" : "text") : "text";

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box.
     */
    export const setFocus = () => {
		if (!!inputElement) {
			inputElement.focus();
		} else {
			// set the local variables
			isEditing = true;
			editStart = true;
			originalText = text;
			size = text.length === 0 ? 10 : text.length;
			let {anchorOffset, focusOffset} = document.getSelection();
			setFromAndTo(anchorOffset, focusOffset);
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
     * It is called from the editor.
     * @param piCaret
     */
    const setCaret = (piCaret: PiCaret) => {
        LOGGER.log("setCaretPosition " + id);
        switch (piCaret.position) {
            case PiCaretPosition.RIGHT_MOST:
                from = to = text.length;
                break;
            case PiCaretPosition.LEFT_MOST:
            case PiCaretPosition.UNSPECIFIED:
                from = to = 0;
                break;
            case PiCaretPosition.INDEX:
				setFromAndTo(piCaret.from, piCaret.to);
				break;
            default:
                break;
        }
        if (isEditing) {
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
        editor.selectedBox = box;
		if (partOfActionBox) {
			$selectedBoxes = [box, box.parent]
		} else {
			$selectedBoxes = [box];
		}
        // set the local variables
        isEditing = true;
        editStart = true;
        originalText = text;
        size = text.length === 0 ? 10 : text.length;
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
        LOGGER.log('onClick: ' + id + ', ' + inputElement?.selectionStart + ", " + inputElement?.selectionEnd);
		setFromAndTo(inputElement.selectionStart, inputElement.selectionEnd);
		if (partOfActionBox) {  // let TextDropdownComponent know, dropdown menu needs to be altered
            LOGGER.log('dispatching from on click')
            dispatcher('textUpdate', {content: text, caret: from});
        }
        event.stopPropagation();
    }

    /**
     * When the <input> element loses focus the function is called. It switches the display back to
     * the <span> element, and stores the current text in the textbox.
     */
    function endEditing() {
        LOGGER.log(' endEditing' + id);
        // reset the local variables
        isEditing = false;
        from = -1;
        to = -1;

        if (!partOfActionBox) {
            // store the current value in the textbox, or delete the box, if appropriate
            runInAction(() => {
            	if (box.deleteWhenEmpty && text.length === 0) {
            		editor.deleteBox(box);
            	} else if (text !== box.getText()) {
            		box.setText(text);
            	}
            });
            if (text !== box.getText()) {
                box.setText(text);
            }
        } else {
            dispatcher('endEditing');
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
        LOGGER.log("TextComponent onKeyDown: [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "] meta [" + event.metaKey + "]");

		if (event.altKey || event.ctrlKey) {  // No shift, because that is handled as normal text
			// first check if this event has a command defined for it
			const cmd: PiCommand = PiEditorUtil.findKeyboardShortcutCommand(toPiKey(event), box, editor);
			if (cmd !== PI_NULL_COMMAND) {
			    let postAction: PiPostAction;
			    runInAction(() => {
			        if (text !== originalText) {
			            box.setText(text);
			        }
			        postAction = cmd.execute(box, toPiKey(event), editor);
			    });
			    if (!!postAction) {
			        postAction();
			    }
			    return;
			}
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
							alert('Text copied to clipboard');
						})
						.catch(err => {
							alert('Error in copying text: ' + err.message);
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
					LOGGER.log("Arrow up, arrow down, enter, escape, or tab pressed: " + event.key);
					if (!partOfActionBox) {
						endEditing();
					} // else, let alias box handle this
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
						if (from !== 0) { // when there are still chars remaining to the left, do not let the parent handle it
							// without propagation, the browser handles which char(s) to be deleted
							// with event.ctrlKey: delete text from caret to end => handled by browser
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
					switch (box.isCharAllowed(text, event.key, from)) {
						case CharAllowed.OK: // add to text, handled by browser
							LOGGER.log('CharAllowed');
							event.stopPropagation();
							// afterUpdate handles the dispatch of the textUpdate to the TextDropdown Component, if needed
							break;
						case CharAllowed.NOT_OK: // ignore
							// ignore any spaces in the text TODO make this depend on textbox.spaceAllowed
							LOGGER.log("KeyPressAction.NOT_OK");
							event.preventDefault();
							event.stopPropagation();
							break;
						case CharAllowed.GOTO_NEXT: // try in previous or next box
							LOGGER.log("KeyPressAction.GOTO_NEXT");
							if (from === 0) {
								editor.selectNextLeaf();
							} else if (to === text.length) {
								editor.selectPreviousLeaf();
							} else {
								// todo break the textbox in two, if possible
							}
							LOGGER.log("    NEXT LEAF IS " + editor.selectedBox.role);
							if (isActionTextBox(editor.selectedBox)) {
								LOGGER.log("     is an action box");
								(editor.selectedBox.parent as ActionBox).triggerKeyPressEvent(event.key);
							} else {
								LOGGER.log("     is NOT an action box");
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
        LOGGER.log("TextComponent onFocusOut")
        if (!partOfActionBox) {
            endEditing();
        } // else let TextDropdownComponent handle it
    }

	/**
	 * When setting the focus programatically, the 'inputElement' variable is not immediately set.
	 * It may be null or undefined! Therefore, we need this check to set the focus.
 	 */
	beforeUpdate(() => {
		if (editStart && !!inputElement) {
			console.log('Before update : ' + id + ", " + inputElement);
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
        LOGGER.log("afterUpdate " + from + ", " + to);
        if (editStart && !!inputElement) {
			LOGGER.log('éditStart')
            inputElement.selectionStart = from >= 0 ? from : 0;
            inputElement.selectionEnd = to >= 0 ? to : 0;
            inputElement.focus();
            editStart = false;
        }
        if (!isEditing && !!spanElement) {
            // TODO test this
            setBoxSizes(box, spanElement.getBoundingClientRect()); // see todo in RenderComponent
        }
        if (isEditing && partOfActionBox) {
			if (text !== originalText) {
				// send event to parent
				LOGGER.log('TextComponent dispatching event with text ' + text + ' from afterUpdate');
				dispatcher('textUpdate', {content: text, caret: from + 1});
			}
        }
    });

    /**
     * When this component is mounted, the setFocus and setCaret functions are
     * made available to the textbox, and the 'text' and 'originalText' variables
     * are set.
     */
    onMount(() => {
        LOGGER.log('onMount');
        box.setFocus = setFocus;
        // box.setCaret = setCaret;
        originalText = text = box.getText();
        placeholder = box.placeHolder;
    });

    /**
     * This function is called when something in the underlying model changes
     */
    autorun(() => {
        LOGGER.log("autorun");
    	if (box instanceof TextBox) {
    		LOGGER.log("role " + box.role + " text [" + text + "] box [" + box.getText() + "] innertText [" + spanElement?.innerText + "] isEditing [" + isEditing + "]");
    		// TODO can the following five statements be moved to onMount() or should they be copied to onMount()?
    		box.setFocus = setFocus;
    		box.setCaret = setCaret;
    		originalText = text = box.getText();
    		placeholder = box.placeHolder;
    		boxType = (box.parent instanceof ActionBox ? "alias" : (box.parent instanceof SelectBox ? "select" : "text"));
    	}
    });

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
</script>


<span on:click={onClick} id="{id}">
	{#if isEditing}
		<span class="resizable-input">
			<input type="text"
                   id="{id}-input"
                   bind:this={inputElement}
                   bind:value={text}
                   on:focusout={onFocusOut}
                   on:keydown={onKeyDown}
				   draggable="true"
				   on:dragstart={onDragStart}
                   size={size}
                   placeholder="{placeholder}"/>
		</span>
	{:else}
		<span class="{box.role} text-box-{boxType} text"
              on:click={startEditing}
              bind:this={spanElement}
              id="{id}-span">
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
        /* To set the height of the input element we must use padding and line-height properties. The height property does not function! */
        padding: 1px 1px;
        line-height: 6px;
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
