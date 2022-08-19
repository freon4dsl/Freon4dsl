<svelte:options accessors={true} />

<script lang="ts">
    import { autorun, runInAction } from "mobx";
    import {
        BACKSPACE,
        DELETE,
        ARROW_DOWN,
        ARROW_LEFT,
        ARROW_RIGHT,
        ARROW_UP,
        ENTER,
        SPACEBAR,
        TAB,
        EVENT_LOG,
        isMetaKey,
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
        ESCAPE,
        SelectBox,
        PiCommand, PI_NULL_COMMAND, PiPostAction, PiEditorUtil, CharAllowed
    } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { AUTO_LOGGER, FOCUS_LOGGER, MOUNT_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";
    import { componentId } from "./util";

    const LOGGER = new PiLogger("TextComponent").mute();
    // Is this component currently being edited by the user?
    export let isEditing: boolean = false;
    export let textBox: TextBox ; // new TextBox(null, "role:", () => "Editable textbox", (v: string) => { });
    export let editor: PiEditor;

    let id: string = componentId(textBox);

    export let getText = (): string => {
        // TODO loopt eentje achter tijdens onKeyDown, want we kunnen de key nog negeren.
        return currentText();
    };

    export const setFocus = () => {
        LOGGER.log("setFocus in SetFocus" + ": box[" + textBox.role + ", " + textBox.caretPosition + "]");
        if (hasFocus()) {
            FOCUS_LOGGER.log("    has focus already");
            return;
        }
        element.focus();
        setCaretPosition(textBox.caretPosition);
    };

    function hasFocus(): boolean {
        return document.activeElement === element;
    }

    /**
     * Decides whether the default behavior of the event should be ignored
     * @param e
     */
    const shouldIgnore = (e: KeyboardEvent): boolean => {
        if (e.altKey) {
            return true;
        }
        return e.key === ENTER || e.key === TAB;
    };

    /**
     * Decides whether the  event should be propagated to the parent component
     * @param e
     */
    const shouldPropagate = (e: KeyboardEvent): boolean => {
        if (isPrintable(e)) {
            return true;
        }
        if (isMetaKey(e)) {
            if (e.key === ARROW_UP || e.key === ARROW_DOWN || e.key === TAB || e.key === SPACEBAR) {
                return true;
            }
        }
        if (e.key === ENTER || e.key === DELETE || e.key === TAB) {
            return true;
        }
        if (e.key === ARROW_UP || e.key === ARROW_DOWN || e.key === ESCAPE) {
            return true;
        }
        const caretPosition = getCaretPosition();
        if (e.key === ARROW_LEFT || e.key === BACKSPACE) {
            return caretPosition <= 0;
        } else if (e.key === ARROW_RIGHT || e.key === DELETE) {
            return caretPosition >= currentLength();
        } else {
            return false;
        }
    };

    function currentLength(): number {
        if (!!element && !!element.innerText) {
            return element.innerText.length;
        } else {
            return 0;
        }
    }

    function currentText(): string {
        if (!!element && !!element.innerText) {
            return element.innerText;
        } else {
            return "";
        }
    }

    let originalText: string;

    onMount(() => {
        MOUNT_LOGGER.log("TextComponent.onMount for role [" + textBox.role + "]");
        textBox.setFocus = setFocus;
        textBox.setCaret = setCaret;
        originalText = textBox.getText();
    });

    /**
     * Used to handle non-printing characters
     * @param event
     */
    const onKeyDown = (event: KeyboardEvent) => {
        LOGGER.log("onKeyDown: [" + event.key + "] alt [" + event.ctrlKey + "] shift [" + event.shiftKey + "] key [" + event.key + "]");
        isEditing = true;
        // if( isAliasTextBox(editor.selectedBox) ) {
        //     // let alias handle this
        //     return;
        // }
        if (event.key === DELETE) {
            if (currentText() === "") {
                if (textBox.deleteWhenEmptyAndErase) {
                    editor.deleteBox(editor.selectedBox);
                    event.stopPropagation();
                    return;
                }
            }
            event.stopPropagation();
            return;
        }
        if (event.key === BACKSPACE) {
            if (currentText() === "") {
                if (textBox.deleteWhenEmptyAndErase) {
                    editor.deleteBox(editor.selectedBox);
                    event.stopPropagation();
                    return;
                }
            }
        }
        if (!shouldPropagate(event)) {
            LOGGER.log("StopPropagation");
            event.stopPropagation();
        }
        if (shouldIgnore(event)) {
            LOGGER.log("preventDefault");
            event.preventDefault();
        }
        const piKey = toPiKey(event);
        if (isMetaKey(event) || event.key === ENTER) {
            // To Be Sure save the current text
            let value = currentText();
            const cmd: PiCommand = PiEditorUtil.findKeyboardShortcutCommand(toPiKey(event), textBox, editor);
            if (cmd !== PI_NULL_COMMAND) {
                let postAction: PiPostAction;
                runInAction(() => {
                    if (value !== originalText) {
                        textBox.setText(value);
                    }
                    postAction = cmd.execute(textBox, toPiKey(event), editor);
                });
                if (!!postAction) {
                    postAction();
                }
            } else {
                LOGGER.log("Key not handled for element " + textBox.element);
                if (event.key === ENTER) {
                    LOGGER.log("   ENTER, so propagate");
                    // Propagate, this action will only be executed withina gridCellComponent.
                    if (value !== originalText) {
                        event["action"] = () => textBox.setText(value);
                    }
                }
            }
        }
    };

    const setCaret = (caret: PiCaret) => {
        switch (caret.position) {
            case PiCaretPosition.RIGHT_MOST:
                LOGGER.log("setCaretPosition RIGHT");
                setCaretToMostRight();
                textBox.caretPosition = textBox.getText().length;
                break;
            case PiCaretPosition.LEFT_MOST:
                LOGGER.log("setCaretPosition LEFT");
                setCaretToMostLeft();
                textBox.caretPosition = 0;
                break;
            case PiCaretPosition.INDEX:
                LOGGER.log("setCaretPosition INDEX");
                setCaretPosition(caret.from);
                textBox.caretPosition = caret.from;
                break;
            case PiCaretPosition.UNSPECIFIED:
                LOGGER.log("setCaretPosition UNSPECIFIED");
                break;
            default:
                LOGGER.log("setCaretPosition ERROR");
                break;
        }
        logBox("setFocus in setCaret");
        // element.focus();
    };

    const setCaretToMostLeft = () => {
        setCaretPosition(0);
    };

    const setCaretToMostRight = () => {
        LOGGER.log("setCaretPosition RIGHT: " + textBox.getText().length);
        setCaretPosition(textBox.getText().length);
    };

    const setCaretPosition = (position: number) => {
        logBox("setCaretPosition: " + position);
        if (position === -1) {
            return;
        }
        try {
            if (position > currentLength()) {
                // TODO Fix the error below
                console.error("ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR; ");
                console.error("TextComponent.setCaretPosition position: " + position + " length: " + currentLength());
                position = currentLength();
            }
            clearSelection();
            const range = document.createRange();
            if (element!.childNodes[0]) {
                range.setStart(element!.childNodes[0], position);
            } else {
                range.setStart(element!, position);
            }
            range.collapse(true);
            window.getSelection().addRange(range);
            LOGGER.log("New position is: " + position);
            textBox.caretPosition = position;
        } catch (e) {
            console.error("TextComponent.setCaretPosition ERROR: " + e.toString());
        }
    };

    const clearSelection = () => {
        window.getSelection().removeAllRanges();
    };

    const onClick = (event: MouseEvent) => {
        logBox("onClick before");
        textBox.caretPosition = getCaretPosition();
        logBox("onClick after");
    };

    function logBox(message: string) {
        LOGGER.log(message + ": box[" + textBox.role + ", " + textBox.caretPosition + "]");
    }

    /**
     * IS triggered for printable keys only,
     * @param event
     */
    const onKeyPress = (event: KeyboardEvent) => {
        LOGGER.log("onKeyPress: " + event.key);
        isEditing = true;
        const insertionIndex = getCaretPosition();
        switch (textBox.isCharAllowed(currentText(), event.key, insertionIndex)) {
            case CharAllowed.OK:
                logBox("CharAllowed.OK");
                break;
            case CharAllowed.NOT_OK:
                LOGGER.log("CharAllowed.NOT_OK");
                event.preventDefault();
                event.stopPropagation();
                break;
            case CharAllowed.GOTO_NEXT:
                LOGGER.log("CharAllowed.GOTO_NEXT");
                editor.selectNextLeaf();
                LOGGER.log("    NEXT LEAF IS " + editor.selectedBox.role);
                if (isAliasTextBox(editor.selectedBox)) {
                    LOGGER.log("     is an alias box");
                    (editor.selectedBox.parent as AliasBox).triggerKeyPressEvent(event.key);
                } else {
                    LOGGER.log("     is NOT an alis box");
                }
                event.preventDefault();
                event.stopPropagation();
                break;
            case CharAllowed.GOTO_PREVIOUS:
                LOGGER.log("CharAllowed.GOTO_PREVIOUS");
                editor.selectPreviousLeaf();
                LOGGER.log("PREVIOUS LEAF IS " + editor.selectedBox.role);
                if (isAliasTextBox(editor.selectedBox)) {
                    (editor.selectedBox.parent as AliasBox).triggerKeyPressEvent(event.key);
                }
                event.preventDefault();
                event.stopPropagation();
                break;
        }
    };

    let text: string = textBox.getText();
    let element: HTMLSpanElement;
    let placeholder: string;

    /**
     * Would like to use onChange event, but that is only defined for <inout>, not for contenteditable.
     * @param e
     */
    const onBlur = (e: FocusEvent) => {
        isEditing = false;
        let value = currentText();
        LOGGER.log("onBlur current [" + value + "] box text [" + textBox.getText() + "] original [" + originalText + "]");
        if (!isAliasTextBox(textBox)) {
            textBox.caretPosition = getCaretPosition();
            if (value !== originalText) {
                textBox.setText(value);
            }            editor.selectedPosition = PiCaret.IndexPosition(textBox.caretPosition);
        }
        if (textBox.deleteWhenEmpty && value.length === 0) {
            EVENT_LOG.info("delete empty text");
            editor.deleteBox(textBox);
        }
        LOGGER.log("END onBlur text [" + currentText() + "]");
    };

    afterUpdate(() => {
        UPDATE_LOGGER.log("TextComponent update [" + isEditing + "] [" + currentText() + "] getText [" + textBox.getText() + "] text [" + text + "] box [" + textBox.role + "] caret [" + textBox.caretPosition + "]");
        textBox.setFocus = setFocus;
        textBox.setCaret = setCaret;
        // If being edited, do not set the value, let the user type whatever (s)he wants
        if (!isEditing) {
            text = textBox.getText();
        }
    });

    export const getCaretPosition = (): number => {
        // TODO This causes an extra afterUpdate in Svelte, don't know why !
        // return window.getSelection().focusOffset;
        return window.getSelection().getRangeAt(0).startOffset;
    };


    let boxType: string = "";

    autorun(() => {
        AUTO_LOGGER.log("TextComponent role " + textBox.role + " text [" + text + "] current [" + currentText() + "] textBox [" + textBox.getText() + "] innertText [" + element?.innerText + "] isEditing [" + isEditing + "]");
        placeholder = textBox.placeHolder;
        // If being edited, do not set the value, let the user type whatever (s)he wants
        // if (!isEditing) {
            text = textBox.getText();
        // }
        boxType = (textBox.parent instanceof AliasBox ? "alias" : (textBox.parent instanceof SelectBox ? "select" : "text"));
        textBox.setFocus = setFocus;
    });

    // const onFocus = async (e: FocusEvent) => {
    //     FOCUS_LOGGER.log("TextComponent.onFocus for box " + textBox.role);
    // };
    // const onBlurHandler = async (e: FocusEvent) => {
    //     FOCUS_LOGGER.log("TextComponent.onBlur for box " + textBox.role);
    // };

</script>

<span class="{textBox.role} text-box-{boxType} text"
      tabindex="0"
      data-placeholdertext={placeholder}
      on:keypress={onKeyPress}
      on:keydown={onKeyDown}
      on:click={onClick}


      on:blur={onBlur}
      contenteditable="true"
      bind:innerHTML={text}
      bind:this={element}
      id="{id}"
></span>

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
