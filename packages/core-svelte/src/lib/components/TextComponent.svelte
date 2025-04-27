<!-- This component switches between a <span> and an <input> HTML element. -->
<!-- This means that there is extra functionality to set the caret position -->
<!-- (cursor or selected text), when the switch is being made. -->

<script lang="ts">
    import { TEXT_LOGGER } from '$lib/components/ComponentLoggers.js';
    import { onMount, tick } from 'svelte';
    import { componentId, replaceHTML } from '$lib/components/svelte-utils/index.js';
    import {
        ActionBox,
        ALT,
        ARROW_DOWN,
        ARROW_LEFT,
        ARROW_RIGHT,
        ARROW_UP,
        BACKSPACE,
        CharAllowed, type ClientRectangle,
        CONTROL,
        DELETE,
        ENTER,
        ESCAPE,
        FreCaret,
        FreCaretPosition,
        isActionBox,
        isNullOrUndefined,
        isSelectBox,
        SelectBox,
        SHIFT,
        TAB,
        TextBox, UndefinedRectangle
    } from "@freon4dsl/core"
    import { TextComponentHelper } from '$lib/components/svelte-utils/TextComponentHelper.js';
    import ErrorTooltip from '$lib/components/ErrorTooltip.svelte';
    import ErrorMarker from '$lib/components/ErrorMarker.svelte';
    import type { TextComponentProps } from '$lib/components/svelte-utils/FreComponentProps.js';
    import {contextMenu} from "$lib/components/stores/AllStores.svelte";

    const LOGGER = TEXT_LOGGER;

    type BoxType = 'action' | 'select' | 'text';

    // Props
    let {
        editor,
        box,
        partOfDropdown,
        isEditing = $bindable(),
        text = $bindable(),
        toParent
    }: TextComponentProps<TextBox> = $props();

    // Variables dependent upon the box, the prop 'text' is one of these.
    // an id for the html element
    let id: string = $state(!isNullOrUndefined(box) ? componentId(box) : 'text-with-unknown-box');
    // the placeholder when value of text component is not present
    let placeholder: string = $state(!isNullOrUndefined(box) ? box.placeHolder : '<..>');
    // variable to remember the text that was in the box previously
    let originalText: string = $state(!isNullOrUndefined(box) ? box.getText() : '');
    // variable for styling
    let placeHolderStyle: string = partOfDropdown
        ? 'text-component-action-placeholder'
        : 'text-component-placeholder';
    // indication how is this text component is used, determines styling
    let boxType: BoxType = $state(
        !isNullOrUndefined(box?.parent)
            ? isActionBox(box?.parent)
                ? 'action'
                : isSelectBox(box?.parent)
                  ? 'select'
                  : 'text'
            : 'text'
    );

    // Variables to alter the state of the component, the prop 'isEditing' is one of these.
    // indicates whether we are just starting to edit, so we need to set the cursor in the <input>
    let editStart = $state(false);
    // indicates whether the user can use the TAB key to enter this component
    // Tab skips spaces before and after operators, which have specific roles.
    let tabindex: number = !isNullOrUndefined(box?.role)
        ? box.role.startsWith('action-binary') || box.role.startsWith('action-exp')
            ? -1
            : 0
        : 0;

    // Variables for showing errors
    let errorCls: string = $state(''); // css class name for when the node is erroneous
    let errMess: string[] = $state([]); // error message to be shown when element is hovered
    let hasErr: boolean = $state(false); // indicates whether this box has errors

    let surroundingElement: HTMLElement = $state()!; // the element that surrounds all other parts of this component
    let spanElement: HTMLSpanElement = $state()!;
    let inputElement: HTMLInputElement = $state()!; // the <input> element on the screen
    let widthSpan: HTMLSpanElement = $state()!; // the width of the <span> element, used to set the width of the <input> element

    // We create an extra object that handles a number of the more complex functions for this component
    let myHelper: TextComponentHelper = new TextComponentHelper(
        box,
        () => {
            return text;
        },
        () => {
            return originalText !== text;
        },
        endEditing,
        toParent
    );

    /* ========	The following functions are called from @freon4dsl/core =========== */

    /**
     * This function is called from the box, whenever the values in the box change.
     * This function updates that part of the state of this component which reflects the state of the box.
     * @param why
     */
    const refresh = (why?: string) => {
        LOGGER.log(
            `${id}: REFRESH why ${why}: (${box?.node?.freLanguageConcept()}) box text '${box?.getText()}' text '${text}'`
        );
        if (!isNullOrUndefined(box)) {
            // 'id' does not change, because it solely depends upon the id of the box, which remains constant,
            // 'placeholderStyle' depends on the type of the box, which remains constant.
            if (placeholder !== box.placeHolder) placeholder = box.placeHolder;
            if (originalText !== box.getText()) originalText = box.getText();
            if (text !== box.getText()) text = box.getText();
            boxType =
                box.parent instanceof ActionBox
                    ? 'action'
                    : box.parent instanceof SelectBox
                      ? 'select'
                      : 'text';
            if (box.hasError) {
                errorCls = 'text-component-text-error';
                errMess = box.errorMessages;
                hasErr = true;
            } else {
                errorCls = '';
                errMess = [];
                hasErr = false;
            }
        }
    };

    /**
     * This function sets the focus on this element programmatically.
     * It is called from the box. When it is called, this component can be in either
     * of two states.
     * (1) The <input> is already shown and the user is editing this
     * text, but something within the Box or FreNode model is changed, thus triggering
     * a call to 'setFocus'.
     * (2) The <span> element is shown (the user is not editing this text), but changes
     * from the Box or FreNode model cause a call to 'setFocus'.
     *
     * The function is exported for use in the TextDropdownComponent.
     */
    // todo why is this function async?
    export async function setFocus(): Promise<void> {
        LOGGER.log(`setFocus for ${box?.id} ${isEditing} && ${inputElement}`);
        if (isEditing && !isNullOrUndefined(inputElement)) {
            inputElement.focus();
        } else {
            // set the local variables, then the inputElement will be shown
            await startEditing('editor');
        }
    }

    /**
     * This function determines the caret position of the <input> element programmatically.
     * The caret position is stored in 'myHelper.from' and 'myHelper.to', and used in 'startEditing'.
     * @param freCaret
     */
    // todo see whether this function needs to be called from the box
    const calculateCaret = (freCaret: FreCaret) => {
        LOGGER.log(`${id}: setCaret ${freCaret.position} [${freCaret.from}, ${freCaret.to}]`);
        switch (freCaret.position) {
            case FreCaretPosition.RIGHT_MOST: // type nr 2
                myHelper.from = myHelper.to = text.length;
                break;
            case FreCaretPosition.LEFT_MOST: // type nr 1
            case FreCaretPosition.UNSPECIFIED: // type nr 0
                myHelper.from = myHelper.to = 0;
                break;
            case FreCaretPosition.INDEX: // type nr 3
                myHelper.setFromAndTo(freCaret.from, freCaret.to);
                break;
            default:
                myHelper.from = myHelper.to = 0;
                break;
        }
    };

    /* ========	The following functions are called from both the browser, and @freon4dsl/core =========== */

    /**
     * When the switch is made from <span> to <input> this function is called.
     * It stores the caret position(s) to be used to set the selection of the <input>.
     */
    async function startEditing(from: string) {
        LOGGER.log(`startEditing for ${box?.id}`);
        // If called from the editor, there is no need to change the selection
        // because the editor already has the corresponding box as selected box.
        // If called from the 'UI' (e.g. by a mouse click), we need to let the
        // editor know that this box/node now has been selected.
        if (from === `UI`) {
            // todo make 'UI' and 'editor' strings into a type
            editor.selectElementForBox(box);
            // Get the caret position(s) of the current selection within the <span> element.
            // To be used to set the same selection in the <input> element later on.
            if (!isNullOrUndefined(document.getSelection())) {
                let { anchorOffset, focusOffset } = document.getSelection()!;
                myHelper.setFromAndTo(anchorOffset, focusOffset);
            }
        } else {
            // Get the caret position(s) from the editor, to be used to set
            // the same selection in the <input> element later on.
            calculateCaret(editor.selectedCaretPosition);
        }
        // set the local variables
        isEditing = true;
        editStart = true;
        originalText = text;
        await tick(); // wait till the <input> is rendered // todo see whether this is really needed
        // Now set the width of <input>, and the caret position,
        // either based on the input from the editor, or from the UI.
        setInputWidth();
        if (isEditing && !isNullOrUndefined(inputElement)) {
            // The check is here only to avoid any null pointer exceptions, in case anything goes wrong.
            inputElement.selectionStart = myHelper.from >= 0 ? myHelper.from : 0;
            inputElement.selectionEnd = myHelper.to >= 0 ? myHelper.to : 0;
            inputElement.focus();
        } else {
            LOGGER.error('startEditing, trying to set caret and focus without input element');
        }
    }

    /**
     * This function is only called when the <span> element is shown. It should trigger the
     * switch from <input> to <span>.
     * When this component is part of a TextDropdown Component, the dropdown options should be shown.
     * @param event
     */
    function onMousedown(event: MouseEvent) {
        LOGGER.log(`onMousedown for ${box?.id}`);
        if (event.button === 0) { // a 'left' click
            event.preventDefault();
            event.stopPropagation();
            // Because we do not propagate the event, we need to hide any context menu 'manually'.
            contextMenu.instance?.hide();
            startEditing('UI');
            if (partOfDropdown) {
                // Tell the TextDropdown that the edit has started.
                toParent('startEditing', { content: text, caret: myHelper.from });
            }
        } // 'right' clicks are handled by parent => should open context menu
        else {
            LOGGER.log('text component: right click mouse down')
        }
    }

    /**
     * This function is only called when the <input> element is shown. Then clicks should not be propagated,
     * because they are used to set the caret position. However, when the caret position changes and
     * this component is part of a TextDropdown Component, the dropdown options should also be altered.
     */
    function onClickInInput() {
        LOGGER.log(`onClickInInput for ${box?.id}`);
        myHelper.setFromAndTo(inputElement.selectionStart, inputElement.selectionEnd);
        if (partOfDropdown) {
            // let TextDropdownComponent know, dropdown menu needs to be altered
            LOGGER.log('dispatching from onClickInInput');
            toParent('textUpdate', { content: text, caret: myHelper.from });
        }
    }

    /**
     * When the <input> element loses focus this function is called. It switches the display back to
     * the <span> element, and stores the current text in the textbox.
     */
    function endEditing() {
        LOGGER.log(`endEditing for ${box?.id}`);
        if (isEditing) {
            // reset the local variables
            isEditing = false;
            myHelper.from = -1;
            myHelper.to = -1;

            if (!partOfDropdown) {
                // store the current value in the textbox, or delete the box, if appropriate
                LOGGER.log(`   save text using box.setText(${text})`);
                if (text !== box.getText()) {
                    LOGGER.log(`   text is new value`);
                    box.setText(text);
                }
            } else {
                toParent('endEditing');
            }
        }
    }

	/**
	 * This function handles any keyboard event that occurs within the <input> element.
	 * Note, we use onKeyDown, because onKeyPress is deprecated.
	 * In case of an ESCAPE in the textComponent, the dropdown is closed, while the editing state remains.
	 * @param event
	 */
	const onKeyDown = (event: KeyboardEvent) => {
		// see https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts
        LOGGER.log(
            `${id}: onKeyDown:  isEditing ${isEditing} key: [${event.key}] alt [${event.altKey}] shift [${event.shiftKey}] ctrl [${event.ctrlKey}] meta [${event.metaKey}]`
        );
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
					if (partOfDropdown) toParent('hideDropdown');
					event.preventDefault();
					event.stopPropagation();
					break;
				}
				case ARROW_DOWN:
				case ARROW_UP:
				// NOTE No explicit call to endEditing needed, as these events are handled by the FreonComponent,
				// and if the selection leaves this textbox, a focusOut event will occur, which does exactly this.
					break;
				case ENTER: {
					if (!partOfDropdown) {
						endEditing()
					}
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
					if (partOfDropdown) toParent('showDropdown');
					myHelper.getCaretPosition(event);
					if (event.shiftKey && event.key === 'Shift') {
						// only shift key pressed, ignore
						event.stopPropagation();
						break;
					}
					switch (box.isCharAllowed(text, event.key, myHelper.from)) {
						case CharAllowed.OK:
							// add char to text, handled by browser
							// dispatch to TextDropdown handled by afterUpdate()
							myHelper.from += 1;
							event.stopPropagation();
							break;
						case CharAllowed.NOT_OK: // ignore
							LOGGER.log('KeyPressAction.NOT_OK');
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
        LOGGER.log(`${id}: onFocusOut ` + ' part of:' + partOfDropdown + ' isEditing:' + isEditing);
        if (!partOfDropdown && isEditing) {
            endEditing();
        } else {
            // else let TextDropdownComponent handle it
            toParent('focusOutTextComponent');
        }
    };

    /**
     * When this element gets focus through the UI, for instance through tabbing, this function
     * is triggered. It does not change the state of the component because 'editor.selectElementForBox(box)'
     * calls the setFocus() function in this component.
     */
    const onFocusIn = () => {
        LOGGER.log(`onFocusIn for ${id}: ` + ' part of:' + partOfDropdown + ' isEditing:' + isEditing);
        editor.selectElementForBox(box);
    };

    /**
     * When this component is mounted, the setFocus, setCaret, and refresh functions are
     * made available to the textbox, and the local variables are set using a call to refresh().
     */
    onMount(() => {
        LOGGER.log(`onMount for ${box?.id}`);
        if (!isNullOrUndefined(box)) {
            box.setFocus = setFocus;
            box.setCaret = calculateCaret;
            box.refreshComponent = refresh;
        }
        refresh('from onMount');
    });

    /**
     * Sets the input width to match the text inside.
     * Copy text from <input> into the <span> with position = absolute and takes the rendered span width.
     * See https://dev.to/matrixersp/how-to-make-an-input-field-grow-shrink-as-you-type-513l
     */
    function setInputWidth() {
        // Note that when the component is mounted (i.e. during onMount), the widthSpan and inputElement variables
        // do not yet have a value. Therefore, it is not useful to call this function from onMount!
        if (!!widthSpan && !!inputElement) {
            LOGGER.log(`setInputWidth for ${box?.id}`);
            let value = inputElement.value;
            if (!isNullOrUndefined(value) && value.length === 0) {
                value = placeholder;
                if (placeholder.length === 0) {
                    value = ' ';
                }
            }
            // Ensure that HTML tags in value are encoded, otherwise they will be seen as HTML.
            widthSpan.innerHTML = replaceHTML(value);
            inputElement.style.width = widthSpan.offsetWidth + 'px';
        }
    }

    /**
     * Often a TextComponent is part of a list, to prevent the list capturing the drag start event, (which should actually
     * select (part of) the text in the input element), this function is defined.
     * Note that if the input element is not defined as 'draggable="true"', this function will never be called.
     * @param event
     */
    function onDragStart(event: DragEvent & { currentTarget: EventTarget & HTMLInputElement }) {
        LOGGER.log(`onDragStart for ${box?.id}`);
        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * This function is needed because onKeydown only reacts to special characters. This
     * function reacts to 'normal' chars, it is executed on every char that is added or deleted in
     * the <input> field.
     */
    function onInput() {
        LOGGER.log(`onInput for ${box?.id}`);
        setInputWidth();
        LOGGER.log(`onInput text is ${text}  value '${inputElement.value}'`);
        if (inputElement.value === '') {
            editor.deleteTextBox(box, box.deleteWhenEmpty);
        }
        if (partOfDropdown) {
            if (text !== originalText) {
                // check added to avoid too many textUpdate events, e.g. when moving through the text with arrows
                // send event to parent TextDropdownComponent
                LOGGER.log(
                  `${id}: dispatching textUpdateFunction with text ` + text + ' from onInput'
                );
                toParent('textUpdate', { content: text, caret: myHelper.from });
            }
        }
    }

    const clientRectangle = (): ClientRectangle => {
        LOGGER.log(`clientRectangle ${box.id} ${isEditing} input ${isNullOrUndefined(inputElement)} span ${isNullOrUndefined(spanElement)}`)

        if (!isNullOrUndefined(inputElement)) {
            LOGGER.log(`clientRectangle ${box.id} using input`)
            return inputElement.getBoundingClientRect()
        }
        if (!isNullOrUndefined(spanElement)) {
            LOGGER.log(`clientRectangle ${box.id} using span`)
            return spanElement.getBoundingClientRect();
        }
        LOGGER.log(`clientRectangle ${box.id} is undefined`)
        return UndefinedRectangle
    }

    $effect(() => {
        if (!isNullOrUndefined(box)) {
            box.getClientRectangle = clientRectangle
        }
    })


    // THE OLD afterUpdate:
    // $effect(() => {
    //     LOGGER.log(`effect 4 for ${box?.id}`)
    //     LOGGER.log(`${id}: afterUpdate ` + myHelper.from + ', ' + myHelper.to + ' id: ' + id);
    //     if (editStart && !!inputElement) {
    //         LOGGER.log(`${id}:  editStart in afterUpdate text '${text}' `);
    //         inputElement.selectionStart = myHelper.from >= 0 ? myHelper.from : 0;
    //         inputElement.selectionEnd = myHelper.to >= 0 ? myHelper.to : 0;
    //         inputElement.focus();
    //         editStart = false;
    //     } else if (isEditing) {
    //         if (partOfDropdown) {
    //             if (text !== originalText) {
    //                 // check added to avoid too many textUpdate events, e.g. when moving through the text with arrows
    //                 // send event to parent TextDropdownComponent
    //                 LOGGER.log(
    //                     `${id}: dispatching textUpdateFunction with text ` + text + ' from afterUpdate'
    //                 );
    //                 dispatcher('textUpdate', { content: text, caret: myHelper.from });
    //             }
    //         }
    //     }
    //     // Always set the input width explicitly.
    //     setInputWidth();
    //     if (!isNullOrUndefined(box)) {
    //         placeholder = box?.placeHolder ? box.placeHolder : '<..>';
    //         box.setFocus = setFocus;
    //         box.setCaret = setCaret;
    //         box.refreshComponent = refresh;
    //     }
    // });
</script>

{#if errMess.length > 0 && box.isFirstInLine}
    <ErrorMarker {editor} {box} />
{/if}
<ErrorTooltip {editor} {box} {hasErr} parentTop={0} parentLeft={0}>
    <span {id} role="none" bind:this={surroundingElement}>
        {#if isEditing}
            <span class="text-component-input">
                <input
                    type="text"
                    class="text-component-input"
                    id="{id}-input"
                    bind:this={inputElement}
                    oninput={onInput}
                    bind:value={text}
                    onclick={onClickInInput}
                    onfocusout={onFocusOut}
                    onkeydown={onKeyDown}
                    draggable="true"
                    ondragstart={onDragStart}
                    {placeholder}
                />
                <span class="text-component-width" bind:this={widthSpan}></span>
            </span>
        {:else}
            <!-- contenteditable must be true, otherwise there is no cursor position in the span after a click,
				 But ... this is only a problem when this component is inside a draggable element (like List or table)
			-->
            <span
                class="{box?.role} text-box-{boxType} text-component-text {errorCls}"
                onmousedown={onMousedown}
                onfocusin={onFocusIn}
                {tabindex}
                bind:this={spanElement}
                contenteditable="true"
                spellcheck="false"
                id="{id}-span"
                role="textbox"
            >
                {#if !!text && text.length > 0}
                    <span class={errorCls}>{text}</span>
                {:else}
                    <span class="{placeHolderStyle} {errorCls}">{placeholder}</span>
                {/if}
            </span>
        {/if}
    </span>
</ErrorTooltip>
