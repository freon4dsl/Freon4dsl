<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->
<!-- Also, in order to make the <input> resizable, it is wrapped into -->
<!-- its own <span> that gets a handle to actually resize it. -->

<script lang="ts">
    import { afterUpdate, onMount, createEventDispatcher } from "svelte";
    import {
        AliasBox, CharAllowed, isAliasTextBox,
        ALT, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, BACKSPACE,
        CONTROL, DELETE, ENTER, ESCAPE,
        SHIFT, TAB, PI_NULL_COMMAND,
        PiCaret,
        PiCaretPosition, PiCommand,
        PiEditor, PiEditorUtil,
        PiLogger, PiPostAction, SelectBox,
        TextBox, toPiKey
    } from "@projectit/core";
    import { componentId } from "./util";
    import { autorun, runInAction } from "mobx";
    import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER } from "./ChangeNotifier";
    import { setBoxSizes } from "./CommonFunctions";

    const LOGGER = new PiLogger("TextComponent").mute();
    const dispatcher = createEventDispatcher();
    type BoxType = "alias" | "select" | "text";

    // Parameters
    export let textBox: TextBox;			// the accompanying textbox
	export let editor: PiEditor;			// the editor
	export let partOfAlias: boolean;		// indication whether this textcomponent is part of a TextDropdownComponent
	// TODO rethink the exporting of the next two parameters
	export let isEditing: boolean = false; 	// indication whether this component is currently being edited by the user, needs to be exported for binding in TextDropdownComponent
	export let text: string;    			// the text to be displayed, needs to be exported for to use 'bind:text' in TextDropdownComponent

    // Local variables
	let id: string;                         // an id for the html element
	id = !!textBox ? componentId(textBox) : 'text-with-unknown-box';
    let spanElement: HTMLSpanElement;       // the <span> element on the screen
    let inputHTMLelement: HTMLInputElement; // the <input> element on the screen
    let placeholder: string;                // the placeholder when value of text component is not present
    let originalText: string;               // variable to remember the text that was in the box previously
    let editStart = false;					// indicates whether we are just starting to edit, so we need to set the cursor in the <input>
    let size = 10;							// the size of the <input>
    let from = -1;							// the cursor position, or when different from 'to', the start of the selected text
    let to = -1;							// the cursor position, or when different from 'from', the end of the selected text
    										// Note that 'from <= to' always holds.

	let boxType: BoxType = "text";          // indication how is this text component used, determines styling
	$: boxType = (textBox?.parent instanceof AliasBox ? "alias" : (textBox?.parent instanceof SelectBox ? "select" : "text"));

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the editor.
     */
    const setFocus = () => {
        // TODO should we check here whether the box is selectable? If so, where else is this check needed?
        LOGGER.log("setFocus " + ": box[" + textBox.role + "]");
        if (document.activeElement === inputHTMLelement || isEditing ) {
            FOCUS_LOGGER.log("TextComponent has focus already");
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
        LOGGER.log("setCaretPosition");
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
            inputHTMLelement.selectionStart = from >= 0 ? from : 0;
            inputHTMLelement.selectionEnd = to >= 0 ? to : 0;
            inputHTMLelement.focus();
        }
    };

    /**
     * When the switch is made from <span> to <input> this function is called.
     * It stores the caret position(s) to be used to set the selection of the <input>,
     * and sets the selectedBox of the editor.
     */
    function startEditing(event: MouseEvent) {
        LOGGER.log('startEditing');
        if (textBox.selectable || partOfAlias) { // TODO is textBox.selectable still needed
            isEditing = true;
            editStart = true;
            originalText = text;
            size = text.length == 0 ? 10 : text.length + 5;
            let {
                anchorOffset, focusOffset
            } = document.getSelection();
            setFromAndTo(anchorOffset, focusOffset);
            editor.selectedBox = textBox;
            event.preventDefault();
            event.stopPropagation();
			dispatcher('startEditing'); // tell the TextDropdown that the edit has started
        } else {
			LOGGER.log('NOT textBox.selectable')
		}
    }

    /**
     * When the <input> element is shown, the clicks should not be propagated.
     * (Clicks either resize the element or set the caret position.)
	 * When this component is part of a TextDropdown Component, the dropdown options should also be altered.
     * @param event
     */
    function onClick(event: MouseEvent) {
        LOGGER.log('TextComponent onClick');
        if (partOfAlias) {  // let TextDropdownComponent know, dropdown menu needs to be altered
			setFromAndTo(inputHTMLelement.selectionStart, inputHTMLelement.selectionEnd);
			LOGGER.log('dispatching from on click')
			dispatcher('textUpdate', {content: text, caret: from});
		}
		// event.preventDefault();
		// event.stopPropagation();
    }

    /**
     * When the <input> element loses focus the function is called. It switches the display back to
     * the <span> element, and stores the current text in the textbox.
     */
    function endEditing() {
        LOGGER.log('TextComponent endEditing');
        // reset the local variables
        isEditing = false;
        from = -1;
        to = -1;

		if (!partOfAlias) {
			// store the current value in the textbox, or delete the box, if appropriate
			runInAction(() => {
				if (textBox.deleteWhenEmpty && text.length === 0) {
					editor.deleteBox(textBox);
				} else if (text !== textBox.getText()) {
					textBox.setText(text);
				}
			});
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
        if (target.selectionEnd < target.selectionStart) {
            from = target.selectionEnd;
            to = target.selectionStart;
        } else {
            from = target.selectionStart;
            to = target.selectionEnd;
        }
    }

    /**
     * This function handles any non-printable keyboard event that occurs within the <input> element.
     * Note, we use onKeyDown, because onKeyPress is deprecated.
     * @param event
     */
    const onKeyDown = (event: KeyboardEvent) => {
        // see https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts
        // stopPropagation on an element will stop that event from happening on the parent (the entire ancestors),
        // preventDefault on an element will stop the event on the element, but it will happen on it's parent (and the ancestors too!)
        LOGGER.log("TextComponent onKeyDown: [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "] meta [" + event.metaKey + "]");

		// TODO use toPiKey to shorten tests on meta keys
        // first check if this event has a command defined for it
        const cmd: PiCommand = PiEditorUtil.findKeyboardShortcutCommand(toPiKey(event), textBox, editor);
        if (cmd !== PI_NULL_COMMAND) {
            let postAction: PiPostAction;
            runInAction(() => {
                if (text !== originalText) {
                    textBox.setText(text);
                }
                postAction = cmd.execute(textBox, toPiKey(event), editor);
            });
            if (!!postAction) {
                postAction();
            }
            return;
        }
        // no command, then check what type of event it is and whether we can handle it here
        switch (event.key) {
			// TODO reorganise switch to be sure that meta keys are handled correctly
            case ALT:
            case CONTROL:
            case SHIFT: { // not relevant if entered separately
                break;
            }
            case ARROW_DOWN:
            case ARROW_UP:
            case ENTER:
            case ESCAPE:
            case TAB: {
                LOGGER.log("Arrow up, arrow down, enter, escape, or tab pressed: " + event.key);
                if (!partOfAlias) {
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
                    editor.selectPreviousLeaf();
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
                    editor.selectNextLeaf();
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
                        if (textBox.deleteWhenEmptyAndErase) {
                            editor.deleteBox(editor.selectedBox);
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
                        if (textBox.deleteWhenEmptyAndErase) {
                            editor.deleteBox(editor.selectedBox);
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

            default: { // the event.key is probably a printable chararcter, still there are these keystrokes to be handled
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
                    navigator.clipboard.readText().then(
                        clipText => LOGGER.log('adding ' + clipText + ' after ' + text[to -1]));
                    // TODO add the clipText to 'text'
                } else {
					getCaretPosition(event);
                    switch (textBox.isCharAllowed(text, event.key, from)) {
						case CharAllowed.OK: // add to text, handled by browser
							// afterupdate handles the dispatch of the textUpdate to the TextDropdown Component, if needed
							event.preventDefault();
							event.stopPropagation();
                            break;
                        case CharAllowed.NOT_OK: // ignore
                            // ignore any spaces in the text TODO make this depend on textbox.spaceAllowed
                            LOGGER.log("KeyPressAction.NOT_OK");
                            event.preventDefault();
                            event.stopPropagation();
                            break;
                        case CharAllowed.GOTO_NEXT: // try in previous or next box
                            LOGGER.log("KeyPressAction.GOTO_NEXT");
                            getCaretPosition(event);
                            if (from === 0) {
                                editor.selectNextLeaf();
                            } else if (to === text.length) {
                                editor.selectPreviousLeaf();
                            }
                            LOGGER.log("    NEXT LEAF IS " + editor.selectedBox.role);
                            if (isAliasTextBox(editor.selectedBox)) {
                                LOGGER.log("     is an alias box");
                                (editor.selectedBox.parent as AliasBox).triggerKeyPressEvent(event.key);
                            } else {
                                LOGGER.log("     is NOT an alias box");
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
    const onFocusOut = () => {
        LOGGER.log("TextComponent onFocusOut")
		if (!partOfAlias) {
			endEditing();
		} // else let TextDropdownComponent handle it
    }

    /**
     * When the HTML is updated, and the switch is made from <span> to <input>,
     * this function sets the caret position(s) on the <input>.
     * Note that 'from <= to' always holds.
     * When the switch from <input> to <span> is made, this function sets the
     * box sizes in the textbox.
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
            // TODO test this
            setBoxSizes(textBox, spanElement.getBoundingClientRect());
        }
        if (isEditing && partOfAlias) {
            // send event to parent
            LOGGER.log('TextComponent dispatching event with text ' + text + ' from afterUpdate');
            dispatcher('textUpdate', {content: text, caret: from});
        }
    });

    /**
     * When this component is mounted, the setFocus and setCaret functions are
     * made available to the textbox, and the 'text' and 'originalText' variables
     * are set.
     */
    onMount(() => {
        LOGGER.log('onMount');
        MOUNT_LOGGER.log("TextComponent.onMount for role [" + textBox.role + "]");
        textBox.setFocus = setFocus;
        textBox.setCaret = setCaret;
        originalText = text = textBox.getText();
    });

    /**
     * TODO when is this function called?
     */
    autorun(() => {
        LOGGER.log("autorun");
		if (textBox instanceof TextBox) {
			AUTO_LOGGER.log("TextComponent role " + textBox.role + " text [" + text + "] textBox [" + textBox.getText() + "] innertText [" + spanElement?.innerText + "] isEditing [" + isEditing + "]");
			// TODO can the following five statements be moved to onMount() or should they be copied to onMount()?
			textBox.setFocus = setFocus;
			textBox.setCaret = setCaret;
			originalText = text = textBox.getText();
			placeholder = textBox.placeHolder;
			boxType = (textBox.parent instanceof AliasBox ? "alias" : (textBox.parent instanceof SelectBox ? "select" : "text"));
		}
    });

</script>

<span on:click={onClick} id="{id}"on:contextmenu|preventDefault={(event) => console.log(event.pageX, event.pageY, event.clientY, event.clientY)}>
	{#if isEditing}
		<span class="resizable-input">
			<input type="text"
                   id="{id}-input"
                   bind:this={inputHTMLelement}
                   bind:value={text}
                   on:focusout={onFocusOut}
                   on:keydown={onKeyDown}
                   size={size}
                   placeholder="{placeholder}"/>
		</span>
	{:else}
		<span class="{textBox.role} text-box-{boxType} text"
              tabIndex={0}
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
