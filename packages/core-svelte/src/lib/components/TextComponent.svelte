<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->

<script lang="ts">
	import { TEXT_LOGGER } from "$lib/components/ComponentLoggers.js";
	import {afterUpdate, beforeUpdate, createEventDispatcher, type EventDispatcher, onMount} from "svelte";
	import { componentId, replaceHTML, setBoxSizes } from "$lib/components/svelte-utils/index.js";
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
		FreCaret,
		FreCaretPosition,
		FreEditor,
		isActionBox,
		isSelectBox,
		SelectBox,
		SHIFT,
		TAB,
		TextBox
	} from "@freon4dsl/core";
	import {TextComponentHelper} from "$lib/components/svelte-utils/TextComponentHelper.js";
	import ErrorTooltip from "$lib/components/ErrorTooltip.svelte";
	import ErrorMarker from "$lib/components/ErrorMarker.svelte";

	// TODO find out better way to handle muting/unmuting of LOGGERs
	const LOGGER = TEXT_LOGGER
	const dispatcher: EventDispatcher<any> = createEventDispatcher();
	type BoxType = "action" | "select" | "text";

	// Parameters
	export let box: TextBox;				// the accompanying textbox
	export let editor: FreEditor;			// the editor
	export let isEditing: boolean = false; 	// indication whether this component is currently being edited by the user, needs to be exported for binding in TextDropdownComponent
	export let partOfDropdown: boolean = false; // indication whether this text component is part of an TextDropdownComponent
	export let text: string;    			// the text to be displayed, needs to be exported for to use 'bind:text' in TextDropdownComponent

	// Local variables
	let id: string;                         // an id for the html element
	id = !!box ? componentId(box) : 'text-with-unknown-box';
	let inputElement: HTMLInputElement; 	// the <input> element on the screen
	let surroundingElement: HTMLElement;	// the element that surrounds all other parts of this component
	let placeholder: string = '<..>';       // the placeholder when value of text component is not present
	let originalText: string;               // variable to remember the text that was in the box previously
	let editStart = false;					// indicates whether we are just starting to edit, so we need to set the cursor in the <input>
	let widthSpan: HTMLSpanElement;			// the width of the <span> element, used to set the width of the <input> element

    // Variables for styling and showing errors
    let errorCls: string = '';              // css class name for when the node is erroneous
    let errMess: string[] = [];             // error message to be shown when element is hovered
    let hasErr: boolean = false;            // indicates whether this box has errors
	let spanElement: HTMLSpanElement = undefined

    // Variables for styling
	let placeHolderStyle: string;
	$: placeHolderStyle = (partOfDropdown ? "text-component-action-placeholder" : "text-component-placeholder");
	let boxType: BoxType = "text";          // indication how is this text component is used, determines styling
	$: boxType = !!box.parent ? (isActionBox(box?.parent) ? "action" : isSelectBox(box?.parent) ? "select" : "text") : "text";

	// We create an extra object that handles a number of the more complex functions for this component
	let myHelper: TextComponentHelper = new TextComponentHelper(box, () => {return text}, () => { return originalText !== text}, endEditing, dispatcher);

	/**
	 * This function sets the focus on this element programmatically.
	 * It is called from the box.
	 */
	export async function setFocus(): Promise<void> {
		LOGGER.log("TextComponent.setFocus "+ id + " input is there: " + !!inputElement);
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
	 * This function sets the caret position of the <input> element programmatically.
	 * It is called from setFocus, so indirectly by the editor.
	 * @param freCaret
	 */
	const setCaret = (freCaret: FreCaret) => {
		LOGGER.log(`${id}: setCaret ${freCaret.position} [${freCaret.from}, ${freCaret.to}]` );
		switch (freCaret.position) {
			case FreCaretPosition.RIGHT_MOST:  // type nr 2
				myHelper.from = myHelper.to = text.length;
				break;
			case FreCaretPosition.LEFT_MOST:   // type nr 1
			case FreCaretPosition.UNSPECIFIED: // type nr 0
				myHelper.from = myHelper.to = 0;
				break;
			case FreCaretPosition.INDEX:       // type nr 3
				myHelper.setFromAndTo(freCaret.from, freCaret.to);
				break;
			default:
				myHelper.from = myHelper.to = 0;
				break;
		}
		if (isEditing && !!inputElement) {
			inputElement.selectionStart = myHelper.from >= 0 ? myHelper.from : 0;
			inputElement.selectionEnd = myHelper.to >= 0 ? myHelper.to : 0;
			inputElement.focus();
			if (partOfDropdown) dispatcher('showDropdown');
		}
	};

	/**
	 * When the switch is made from <span> to <input> this function is called.
	 * It stores the caret position(s) to be used to set the selection of the <input>,
	 * and sets the selectedBox of the editor.
	 * Called when clicked on the <span> element.
	 */
	function startEditing(event: Event) {
		LOGGER.log(`${id}: startEditing event type is ${event.type}`);
		// set the global selection
		editor.selectElementForBox(box);
		// set the local variables
		isEditing = true;
		editStart = true;
		originalText = text;
		let {anchorOffset, focusOffset} = document.getSelection();
		myHelper.setFromAndTo(anchorOffset, focusOffset);
		event.preventDefault();
		event.stopPropagation();
		if (partOfDropdown && event.type === "click") {
			dispatcher('startEditing', {content: text, caret: myHelper.from}); // tell the TextDropdown that the edit has started
		}
	}

	/**
	 * This function is only called when the <input> element is shown. Then clicks should not be propagated.
	 * (Clicks either resize the element or set the caret position.)
	 * When this component is part of a TextDropdown Component, the dropdown options should also be altered.
	 * @param event
	 */
	function onClick(event: MouseEvent) {
		LOGGER.log(`onClick enter isEditing ${isEditing}`)
		if (!!inputElement) {
			LOGGER.log('onClick: for input element ' + id + ', ' + inputElement?.selectionStart + ", " + inputElement?.selectionEnd);
			myHelper.setFromAndTo(inputElement.selectionStart, inputElement.selectionEnd);
		} else {
			LOGGER.log("onClick without input")
		}
		if (partOfDropdown) {  // let TextDropdownComponent know, dropdown menu needs to be altered
			LOGGER.log(`textUpdate from onClick`)
			dispatcher('showDropdown')
			dispatcher('textUpdate', {content: text, caret: myHelper.from});
		}
		event.stopPropagation();
	}
	function onClick2(event: MouseEvent) {
		LOGGER.log(`on 2  isEditing ${isEditing}`)
		startEditing(event)
	}
	/**
	 * When the <input> element loses focus the function is called. It switches the display back to
	 * the <span> element, and stores the current text in the textbox.
	 */
	function endEditing() {
		LOGGER.log(`${id}:  endEditing text is '${text}'  isEditing ${isEditing}` );
		if (isEditing) {
			// reset the local variables
			isEditing = false;
			myHelper.from = -1;
			myHelper.to = -1;

			if (!partOfDropdown) {
				// store the current value in the textbox, or delete the box, if appropriate
				LOGGER.log(`   save text using box.setText(${text})`)
				if (box.deleteWhenEmpty && text.length === 0) {
					// editor.deleteBox(box);
				} else if (text !== box.getText()) {
					LOGGER.log(`   text is new value`)
					box.setText(text);
				}
			} else {
				dispatcher('endEditing');
			}
		}
	}


	const onKeyDownSpan = (event: KeyboardEvent) => {
		LOGGER.log(`${id}: onKeyDownSpan: [${event.key}] alt [${event.altKey}] shift [${event.shiftKey}] ctrl [${event.ctrlKey}] meta [${event.metaKey}]`);
	}
	/**
	 * This function handles any keyboard event that occurs within the <input> element.
	 * Note, we use onKeyDown, because onKeyPress is deprecated.
	 * In case of an ESCAPE in the textComponent, the dropdown is closed, while the editing state remains.
	 * @param event
	 */
	const onKeyDown = (event: KeyboardEvent) => {
		// see https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts
		// stopPropagation on an element will stop that event from happening on the parent (the entire ancestors),
		// preventDefault on an element will stop the event on the element, but it will happen on it's parent (and the ancestors too!)
		LOGGER.log(`${id}: onKeyDown:  isEditing ${isEditing} key: [${event.key}] alt [${event.altKey}] shift [${event.shiftKey}] ctrl [${event.ctrlKey}] meta [${event.metaKey}]`);
		if (event.key === TAB) {
			// Do nothing, browser handles this
		} else if (event.key === SHIFT || event.key === CONTROL || event.key === ALT) { // ignore meta keys
			LOGGER.log("META KEY: stop propagation")
			event.stopPropagation();
		} else if (event.altKey || event.ctrlKey) { // No shift, because that is handled as normal text
			myHelper.handleAltOrCtrlKey(event, editor);
		} else { // handle non meta keys
			switch (event.key) {
				case ESCAPE: {
					if (partOfDropdown) dispatcher('hideDropdown');
					event.preventDefault();
					event.stopPropagation();
					break;
				}
				case ARROW_DOWN:
				case ARROW_UP:
				case ENTER: {
					// NOTE No explicit call to endEditing needed, as these events are handled by the FreonComponent,
					// and if the selection leaves this textbox, a focusOut event will occur, which does exactly this.
					break;
				}
				case ARROW_LEFT: {
					myHelper.handleArrowLeft(event);
					break;
				}
				case ARROW_RIGHT: {
					myHelper.handleArrowRight(event);
					break;
				}
				case BACKSPACE: {
					myHelper.handleBackSpace(event, editor);
					break;
				}
				case DELETE: {
					myHelper.handleDelete(event, editor);
					break;
				}
				default: { // the event.key is SHIFT or a printable character
					if (partOfDropdown) dispatcher('showDropdown');
					myHelper.getCaretPosition(event);
					if (event.shiftKey && event.key === "Shift") {
						// only shift key pressed, ignore
						event.stopPropagation();
						break
					}
					switch (box.isCharAllowed(text, event.key, myHelper.from)) {
						case CharAllowed.OK:
							// add char to text, handled by browser
							// dispatch to TextDropdown handled by afterUpdate()
							myHelper.from += 1;
							event.stopPropagation();
							break;
						case CharAllowed.NOT_OK: // ignore
							LOGGER.log("KeyPressAction.NOT_OK");
							event.preventDefault();
							event.stopPropagation();
							break;
						case CharAllowed.GOTO_NEXT: // try in previous or next box
							myHelper.handleGoToNext(event, editor, id);
							break;
						case CharAllowed.GOTO_PREVIOUS: // try in previous or next box
							myHelper.handleGoToPrevious(event, editor, id);
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
		LOGGER.log(`${id}: onFocusOut `+ " partof:" + partOfDropdown + " isEditing:" + isEditing)
		if (!partOfDropdown && isEditing) {
			endEditing();
		} else {
			// else let TextDropdownComponent handle it
			dispatcher("focusOutTextComponent")
		}
	}
	const onFocusIn = () => {
		LOGGER.log(`onFocusIn ${id}: `+ " partof:" + partOfDropdown + " isEditing:" + isEditing)
		editor.selectElementForBox(box)
	}
	const onFocusInSpan = (event: FocusEvent) => {
		LOGGER.log(`onFocusInSpan ${id}: `+ " partof:" + partOfDropdown + " isEditing:" + isEditing)
		editor.selectElementForBox(box)
		// startEditing(event)
	}

	const refresh = (why?: string) => {
		LOGGER.log(`${id}: REFRESH why ${why}: (${box?.node?.freLanguageConcept()}) boxtext '${box.getText()}' text '${text}'`)
		placeholder = box.placeHolder;
		text = box.getText();
        if (box.hasError) {
            errorCls = 'text-component-text-error';
            errMess = box.errorMessages;
            hasErr = true;
        } else {
            errorCls = "";
            errMess = [];
            hasErr = false;
        }
		boxType = (box.parent instanceof ActionBox ? "action" : (box.parent instanceof SelectBox ? "select" : "text"));
		setInputWidth();
	}

	/**
	 * When setting the focus programmatically, the 'inputElement' variable is not immediately set.
	 * It may be null or undefined! Therefore, we need this check to set the focus.
	 */
	beforeUpdate(() => {
		LOGGER.log(`${id}: beforeUpdate `)
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
	 * Note that 'myHelper.from <= myHelper.to' always holds.
	 * When the switch from <input> to <span> is made, this function sets the
	 * box sizes in the textbox.
	 */
	afterUpdate(() => {
		LOGGER.log(`${id}: afterUpdate ` + myHelper.from + ", " + myHelper.to + " id: " + id);
		if (editStart && !!inputElement) {
			LOGGER.log(`${id}:  editStart in afterUpdate text '${text}' `)
			inputElement.selectionStart = myHelper.from >= 0 ? myHelper.from : 0;
			inputElement.selectionEnd = myHelper.to >= 0 ? myHelper.to : 0;
			inputElement.focus();
			editStart = false;
		} else if (isEditing) {
			 if (partOfDropdown) {
				if (text !== originalText) { // check added to avoid too many textUpdate events, e.g. when moving through the text with arrows
					// send event to parent TextDropdownComponent
					LOGGER.log(`${id}: dispatching textUpdateFunction with text ` + text + ' from afterUpdate');
					dispatcher('textUpdate', {content: text, caret: myHelper.from});
				}
			}
		}
		// Always set the input width explicitly.
		setInputWidth();
		placeholder = box.placeHolder
		box.setFocus = setFocus;
		box.setCaret = setCaret;
		box.refreshComponent = refresh;
		// NB This is needed here because this component is not shown using RenderComponent if it is part of a TextDropdownComponent.
		if (!!inputElement) { // upon initialization the element might be null
			setBoxSizes(box, inputElement.getBoundingClientRect());
		}
		if (!!spanElement) { // upon initialization the element might be null
			setBoxSizes(box, spanElement.getBoundingClientRect());
		}
	});

	/**
	 * When this component is mounted, the setFocus and setCaret functions are
	 * made available to the textbox, and the 'text' and 'originalText' variables
	 * are set.
	 */
	onMount(() => {
		LOGGER.log("onMount" + " for element "  + box?.node?.freId() + " (" + box?.node?.freLanguageConcept() + ")" + " original text: '" + box.getText() + "'");
		originalText = box.getText();
		text = box.getText();
		placeholder = box.placeHolder;
		setInputWidth();
		box.setFocus = setFocus;
		box.setCaret = setCaret;
		box.refreshComponent = refresh;
	});

	/**
	 * Sets the input width to match the text inside.
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
			inputElement.style.width = widthSpan.offsetWidth + "px";
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
	function onDragStart(event: DragEvent & { currentTarget: EventTarget & HTMLInputElement; }) {
		LOGGER.log('on drag start');
		event.stopPropagation();
		event.preventDefault();
	}

	function onInput() {
		setInputWidth();
		LOGGER.log(`onInput text is ${text}  value '${inputElement.value}'`)
		if (inputElement.value === "") {
			editor.deleteTextBox(box, box.deleteWhenEmpty)
		}
	}

	const tabindex = (box.role.startsWith("action-binary") || box.role.startsWith("action-exp") ? -1 : 0)
	refresh();
</script>

{#if errMess.length > 0 && box.isFirstInLine}
	<ErrorMarker element={surroundingElement} {box}/>
{/if}
<ErrorTooltip {box} hasErr={hasErr} parentTop={0} parentLeft={0}>
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
	<span on:click={onClick2} id="{id}" role="none" bind:this={surroundingElement}>
		{#if isEditing}
			<span class="text-component-input">
				<input type="text"
					   class="text-component-input"
					   id="{id}-input"
					   bind:this={inputElement}
					   on:input={onInput}
					   bind:value={text}
					   on:focusout={onFocusOut}
					   on:focusin={onFocusIn}
					   on:keydown={onKeyDown}
					   draggable="true"
					   on:dragstart={onDragStart}
					   placeholder="{placeholder}"/>
				<span class="text-component-width" bind:this={widthSpan}></span>
			</span>
		{:else}
			<!-- contenteditable must be true, otherwise there is no cursor position in the span after a click,
				 But ... this is only a problem when this component is inside a draggable element (like List or table)
			-->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
			<span class="{box.role} text-box-{boxType} text-component-text {errorCls}"
				  on:mousedown={onClick}
				  on:focusin={onFocusInSpan}
				  tabindex="{tabindex}"
				  bind:this={spanElement}
				  contenteditable=true
				  on:keydown={onKeyDownSpan}
				  spellcheck=false
				  id="{id}-span"
				  role="textbox">
				{#if !!text && text.length > 0}
					{text}
				{:else}
					<span class="{placeHolderStyle} {errorCls}">{placeholder}</span>
				{/if}
			</span>
		{/if}
	</span>
</ErrorTooltip>
