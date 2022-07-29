<script lang="ts">
    import { autorun, runInAction } from "mobx";
    import {
        KEY_BACKSPACE,
        KEY_DELETE,
        KEY_ARROW_DOWN,
        KEY_ARROW_LEFT,
        KEY_ARROW_RIGHT,
        KEY_ARROW_UP,
        KEY_ENTER,
        KEY_SPACEBAR,
        KEY_TAB,
        EVENT_LOG,
        isMetaKey,
        KeyPressAction,
        PiUtils,
        TextBox,
        PiEditor,
        toPiKey,
        isAliasTextBox,
        PiCaret,
        PiCaretPosition,
        PiLogger,
        isPrintable,
        AliasBox,
        KEY_ESCAPE,
        SelectBox,
        PiCommand, PI_NULL_COMMAND, PiPostAction, KEY_ALT, KEY_SHIFT, KEY_CONTROL
    } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import { componentId } from "./util";
    import SelectableComponent from "./SelectableComponent.svelte";
    import TextComponent from "./TextComponent.svelte";

    const LOGGER = new PiLogger("TextComponent").mute();
    type BoxType = "alias" | "select" | "text"; // TODO question: is 'select' still an option?

    // Parameters
    export let isEditing: boolean = false; // Is this component currently being edited by the user?
    export let textBox: TextBox;
    export let editor: PiEditor;

    // Local variables
    let id: string = componentId(textBox);
    let text: string = textBox.getText();   // the text to be displayed
    let element: HTMLSpanElement;           // the element on the screen
    let placeholder: string;                // the placeholder when value of text component is not present
    let originalText: string;               // variable to remember the text that was in the box previously
    let boxType: BoxType = "text";          // indication how is this text component used

    // Exported functions
    export const setFocus = () => {
        console.log('setFocus');
        // FOCUS_LOGGER.log("setFocus " + ": box[" + textBox.role + ", " + textBox.caretPosition + "]");
        if (document.activeElement === element) {
            FOCUS_LOGGER.log("    has focus already");
            return;
        }
        element.focus();
        // TODO question: what about selectable component???
    };

    // Local behaviour
    onMount(() => {
        console.log('onMount');
        MOUNT_LOGGER.log("TextComponent.onMount for role [" + textBox.role + "]");
        textBox.setFocus = setFocus;
        textBox.setCaret = setCaret;
        originalText = textBox.getText();
    });

    // Helper functions

    // Note that innerText returns the HTML element (entire code) as a string and displays HTML element on the screen (as HTML code),
    // while innerHTML returns only text content of the HTML element.

    // THESE ARE NOT UPDATED CORRECTLY
    // let currentLength: number = 0;
    // $: currentLength = element?.innerHTML?.length;
    // let currentText: string;
    // $: currentText = element?.innerHTML;

    function logBox(message: string) {
        // console.log(message + ": box[" + textBox.role + ", " + textBox.caretPosition + "]");
    }

    function endEditing() {
        runInAction(() => {
            if (text !== originalText) {
                textBox.setText(text);
            }
            isEditing = false;
        });
    }

    // Caret position functions

    const setCaret = (piCaret: PiCaret) => {
        console.log("setCaret");
        switch (piCaret.position) {
            case PiCaretPosition.RIGHT_MOST:
                console.log("setCaretPosition RIGHT: " + text.length);
                setCaretPosition(text.length);
                break;
            case PiCaretPosition.LEFT_MOST:
                LOGGER.log("setCaretPosition LEFT");
                setCaretPosition(0);
                break;
            case PiCaretPosition.INDEX: // TODO: should be removed, because it cannot be done without a mouse click
                LOGGER.log("setCaretPosition INDEX");
                // setCaretPosition(piCaret.index);
                break;
            case PiCaretPosition.UNSPECIFIED:
                LOGGER.log("setCaretPosition UNSPECIFIED");
                break;
            default:
                LOGGER.log("setCaretPosition ERROR");
                break;
        }
    };

    const setCaretPosition = (position: number) => {
        console.log("setCaretPosition: " + position);

        // NOTE: we cannot set the position in a span with a single text, this can only be done in input/textarea elements
        // Range.setStart: If the startNode is a Node of type Text, Comment, or CDataSection, then startOffset is
        // the number of characters from the start of startNode. For other Node types, startOffset is the number of child
        // nodes from the start of the startNode.

        // Therefore, we have added an unvisible comment node after the <span>. When the caret should be after the text,
        // we set the range to end at this comment.
        let range = new Range();
        range.setStart(element, 0);
        if (position === text.length -1) {
            range.setEnd(element, 1);
        } else {
            range.setEnd(element, 0);
        }
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(range);

    };

    const getCaretPosition = (): number => {
        console.log("getCaretPosition");
        return Math.min(document.getSelection().anchorOffset, document.getSelection().focusOffset);
    };

    // Event handlers

    const onClick = (event: MouseEvent) => {
        console.log("onClick, caret: " + getCaretPosition());
        isEditing = true;
    };

    // EXAMPLE
    // document.onselectionchange = function() {
    //     let {
    //         anchorNode, anchorOffset, focusNode, focusOffset
    //     } = document.getSelection();
    //     let from = `${anchorNode && anchorNode.data}:${anchorOffset}`;
    //     let to = `${focusNode && focusNode.data}:${focusOffset}`;
    //     console.log( "document.onselectionchange: " + from + " --- " + to);
    // };

    const onKeyDown = (event: KeyboardEvent) => {
        // see https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts
        isEditing = true;
        console.log("onKeyDown: [" + event.key + "] alt [" + event.altKey + "] shift [" + event.shiftKey + "] ctrl [" + event.ctrlKey + "]");
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
                if (getCaretPosition() !== 0) { // when the arrow key can stay within the text, do not let the parent handle it
                    event.stopPropagation();
                } else { // the key will cause this element to lose focus, its content should be saved
                    endEditing();
                }
                break;
            }
            case KEY_ARROW_RIGHT: {
                if (getCaretPosition() !== text.length) { // when the arrow key can stay within the text, do not let the parent handle it
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
                    // UNDO
                } else if (!event.ctrlKey && event.altKey && event.shiftKey) { // alt-shift-backspace
                    // REDO
                } else {
                    if (getCaretPosition() !== 0) { // when there are still chars remaining to the left, do not let the parent handle it
                        // without propagation, the browser handles which char(s) to be deleted
                        // with event.ctrlKey: delete text from caret to end => handled by browser
                        event.stopPropagation();
                    } else { // the key will cause this element to lose focus, its content should be saved
                        endEditing();
                    }
                }
                break;
            }
            case KEY_DELETE: {
                if (!event.ctrlKey && !event.altKey && event.shiftKey) { // shift-delete
                    // CUT
                } else {
                    if (getCaretPosition() !== text.length) { // when there are still chars remaining to the right, do not let the parent handle it
                        // without propagation, the browser handles which char(s) to be deleted
                        // with event.ctrlKey: delete text from caret to 0 => handled by browser
                        event.stopPropagation();
                    } else { // the key will cause this element to lose focus, its content should be saved
                        endEditing();
                    }
                }
                break;
            }
            case KEY_SPACEBAR: { // ignore any spaces in the text
                event.stopPropagation();
                event.preventDefault();
                break;
            }
            // TODO: should the following keys do something?
            case KEY_ENTER: {
                break;
            }
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
                        clipText => console.log('adding ' + clipText + ' after ' + text[getCaretPosition() -1]));
                    // TODO add the clipText to 'text'
                }
                // all other keys are added to the text
            }
        }
    };

    const onBlur = (event: FocusEvent) => {
        console.log("onBlur");
        endEditing();
    };

    afterUpdate(() => {
        // this function does not do anything useful, it only shows what the document selection is on the console
        let {
            anchorNode, anchorOffset, focusNode, focusOffset
        } = document.getSelection();
        let from = `${anchorNode && anchorNode.data}:${anchorOffset}`;
        let to = `${focusNode && focusNode.data}:${focusOffset}`;
        console.log( "afterUpdate: " + from + " --- " + to);
    });

    autorun(() => {
        console.log("autorun");
        AUTO_LOGGER.log("TextComponent role " + textBox.role + " text [" + text + "] textBox [" + textBox.getText() + "] innertText [" + element?.innerText + "] isEditing [" + isEditing + "]");
        placeholder = textBox.placeHolder;
    });

</script>

<!--  The reason for the use of a contenteditable span is that we need the box to be content aware AND
adapt its size dynamically (both width and height). Using <input> does not support the latter. -->
<div>
    {#if isEditing}
        <input type="text"
               id="{id}-input"
               placeholder="{placeholder}"


               on:click={onClick}
               on:blur={onBlur}
               bind:value={text}
        >
    {:else}
        <span class="{textBox.role} text-box-{boxType} text"
              tabindex="0"
              data-placeholdertext={placeholder}
              on:keydown={onKeyDown}
              on:click={onClick}
              on:blur={onBlur}
              contenteditable="true"
              bind:innerHTML={text}
              bind:this={element}
              id="{id}"
        ></span>
    {/if}
</div>
<comment></comment>
<!-- comment is an unvisible placeholder for the caret position PiCaretPosition.RIGHT_MOST -->

<style>
    .text:empty:before {
        content: attr(data-placeholdertext);
        color: var(--freon-text-component-color, blue);
        background-color: var(--freon-text-component-background-color, inherit);
        font-family: var(--freon-text-component-font-family, "Arial");
        font-size: var(--freon-text-component-font-size, 14pt);
        font-weight: var(--freon-text-component-font-weight, inherit);
        font-style: var(--freon-text-component-font-style, inherit);
        padding: var(--freon-text-component-padding, 1px);
        margin: var(--freon-text-component-margin, 1px);
        display: inherit;
        white-space: inherit;
        border: inherit;
        opacity: 50%;
    }

    .text {
        content: attr(data-placeholdertext);
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
