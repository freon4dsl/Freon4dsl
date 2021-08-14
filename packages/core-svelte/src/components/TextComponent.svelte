<svelte:options accessors={true}/>

<script lang="ts">
    import { autorun } from "mobx";
    import {
        KEY_BACKSPACE,
        KEY_DELETE,
        KEY_ARROW_DOWN,
        KEY_ARROW_LEFT,
        KEY_ARROW_RIGHT,
        KEY_ARROW_UP,
        KEY_ENTER, KEY_SPACEBAR,
        KEY_TAB,
        EVENT_LOG,
        isAliasBox,
        isMetaKey,
        KeyPressAction, PiUtils,
        TextBox,
        PiEditor,
        toPiKey,
        PiCaret, PiCaretPosition, PiLogger, isPrintable
    } from "@projectit/core";
    import { afterUpdate, onMount } from "svelte";
    import { AUTO_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";

    const LOGGER = new PiLogger("TextComponent");

    export let textBox = new TextBox(null, "role:", () => "Editable textbox", (v: string) => {});
    export let editor: PiEditor;
    export let textOnScreen: string;

    export let getText = (): string => {
        // TODO loopt eentje achter tijdens onKeyDown
        return textOnScreen;
    }
    export const focus = async (): Promise<void> => {
        LOGGER.log("focus: " + textBox.role);
        element.focus();
        // this.startEditing();
    };

    let caretPosition: number = 0;
    const setFocus = async (): Promise<void> => {
        LOGGER.log("set focus: " + textBox.role);
        element.focus();
        setCaretPosition(textBox.caretPosition)
        // this.startEditing();
    };

    /**
     * Decides whether the default behavior of the event should be ignored
     * @param e
     */
    const shouldIgnore = (e: KeyboardEvent): boolean => {
        if (e.altKey) {
            return true;
        }
        return e.key === KEY_ENTER || e.key === KEY_TAB;
    };

    /**
     * Decides whether the  event should be propagated to the parent component
     * @param e
     */
    const shouldPropagate = (e: KeyboardEvent): boolean => {
        if(isPrintable(e)){
            return true;
        }
        if (isMetaKey(e)) {
            if (e.key === KEY_ARROW_UP || e.key === KEY_ARROW_DOWN || e.key === KEY_TAB || e.key === KEY_SPACEBAR) {
                return true;
            }
        }
        if (e.key === KEY_ENTER || e.key === KEY_DELETE || e.key === KEY_TAB) {
            return true;
        }
        if (e.key === KEY_ARROW_UP || e.key === KEY_ARROW_DOWN) {
            return true;
        }
        const caretPosition = getCaretPosition();
        if (e.key === KEY_ARROW_LEFT || e.key === KEY_BACKSPACE) {
            return caretPosition <= 0;
        } else if (e.key === KEY_ARROW_RIGHT || e.key === KEY_DELETE) {
            return caretPosition >= textOnScreen.length;
        } else {
            return false;
        }
    };

    onMount( () => {
        LOGGER.log("onMount for role ["+ textBox.role + "]")
        textBox.setFocus = setFocus;
        textBox.setCaret = setCaret;
        caretPosition = textBox.caretPosition;
    });

    /**
     * Used to handle non-printing characters
     * @param event
     */
    const onKeyDown = async (event: KeyboardEvent) => {
        LOGGER.log("onKeyDown: ["+ event.key + "] alt [" + event.ctrlKey+  "] shift [" + event.shiftKey + "] key [" + event.key +"]");
        // const caretPosition = getCaretPosition();
        if (event.key === KEY_DELETE) {
            if (textOnScreen === "") {
                if (textBox.deleteWhenEmptyAndErase) {
                    await editor.deleteBox(editor.selectedBox);
                    event.stopPropagation();
                    return;
                }
            }
            event.stopPropagation();
            return;
        }
        if (event.key === KEY_BACKSPACE) {
            if (textOnScreen === "") {
                if (textBox.deleteWhenEmptyAndErase) {
                    await editor.deleteBox(editor.selectedBox);
                    event.stopPropagation();
                    return;
                }
            }
        }
        if (!shouldPropagate(event)) {
            LOGGER.log("StopPropagation")
            event.stopPropagation();
        }
        if (shouldIgnore(event)) {
            event.preventDefault();
        }
        const piKey = toPiKey(event);
        if (isMetaKey(event)) {
            const isKeyboardShortcutForThis = await PiUtils.handleKeyboardShortcut(piKey, textBox, editor);
            if (!isKeyboardShortcutForThis) {
                LOGGER.log("Key not handled for element " + textBox.element);
                if(event.key === KEY_ENTER){
                    LOGGER.log("   ENTER, so propagate");
                    return;
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
                setCaretPosition(caret.index);
                textBox.caretPosition = caret.index;
                break;
            case PiCaretPosition.UNSPECIFIED:
                LOGGER.log("setCaretPosition UNSPECIFIED");
                break;
            default:
                LOGGER.log("setCaretPosition ERROR");
                break;
        }
        element.focus();
    };

    const setCaretToMostLeft = () => {
        // this.startEditing();
        setCaretPosition(0);
    };

    const setCaretToMostRight = () => {
        // this.startEditing();
        LOGGER.log("setCaretPosition RIGHT: " + textBox.getText().length);
        setCaretPosition(textBox.getText().length);
    };

    const setCaretPosition = (position: number) => {
        LOGGER.log("setCaretPosition: " + position);
        if (position === -1) {
            return;
        }
        // if (!this.element.innerText) {
        //     // TODO Find out why innertext can be falsy.
        //     return;
        // }
        try {
            if (position > textOnScreen.length) {
                // TODO Fix the error below
                console.error("ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR; ");
                console.error("TextComponent.setCaretPosition position: " + position + " length: " + textOnScreen.length);
                position = this.element.innerText.length;
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
            LOGGER.log("New position is: "+ position)
            caretPosition = position;
            textBox.caretPosition = position;
        } catch (e) {
            console.error("TextComponent.setCaretPosition ERROR: " + e.toString());
        }
    };

    const clearSelection = () => {
        window.getSelection().removeAllRanges();
    };

    const onClick = (event: MouseEvent) => {
        textBox.caretPosition = getCaretPosition();
        caretPosition = textBox.caretPosition;
        LOGGER.log("onClick caret position = " + textBox.caretPosition);
    }

    /**
     * IS triggered for printable keys only,
     * @param event
     */
    const onKeyPress = async (event: KeyboardEvent) => {
        LOGGER.log("onKeyPress: " + event.key);// + " text binding [" + textOnScreen + "] w: " + textBox.actualWidth);
        const insertionIndex = getCaretPosition();
        // await wait(0);
        switch (textBox.keyPressAction(textBox.getText(), event.key, insertionIndex)) {
            case KeyPressAction.OK:
                LOGGER.log("KeyPressAction.OK");
                // Not needed in Svelte, because of bind:
                // textBox.update();
                // textBox.caretPosition = getCaretPosition() + 1;
                break;
            case KeyPressAction.NOT_OK:
                LOGGER.log("KeyPressAction.NOT_OK");
                event.preventDefault();
                event.stopPropagation();
                break;
            case KeyPressAction.GOTO_NEXT:
                LOGGER.log("KeyPressAction.GOTO_NEXT");
                editor.selectNextLeaf();
                LOGGER.log("NEXT LEAF IS " + editor.selectedBox.role);
                if (isAliasBox(editor.selectedBox)) {
                    editor.selectedBox.triggerKeyPressEvent(event.key);
                }
                event.preventDefault();
                event.stopPropagation();
                break;
            case KeyPressAction.GOTO_PREVIOUS:
                LOGGER.log("KeyPressAction.GOTO_PREVIOUS");
                editor.selectPreviousLeaf();
                LOGGER.log("PREVIOUS LEAF IS " + editor.selectedBox.role);
                if (isAliasBox(editor.selectedBox)) {
                    editor.selectedBox.triggerKeyPressEvent(event.key);
                }
                event.preventDefault();
                event.stopPropagation();
                break;
        }
        // LOGGER.log("CARET POSITION ["+ textOnScreen + "]")
    };

   textBox.update = () => {
        LOGGER.log("Update called for textBox ["+ textOnScreen + "]") ;
        if( textBox.getText() !== textOnScreen  && (textOnScreen !== undefined)) {
            LOGGER.log("    ==> value changed");
            textBox.setText(textOnScreen);
        }
    };

    let text: string = textBox.getText();
    textOnScreen = text;
    let element: HTMLDivElement;
    let placeholder: string;

    const onInput = async (e: InputEvent) => {
        const value = (e.target as HTMLElement).innerText;

        LOGGER.log("onInput `" + e.data + ":  textOnScreen [" + textOnScreen + "] box text ["+ textBox.getText() + "]");
        // textBox.caretPosition = getCaretPosition();
        // caretPosition = textBox.caretPosition;
        // editor.selectedPosition = PiCaret.IndexPosition(textBox.caretPosition);
        if (textBox.deleteWhenEmpty && value.length === 0) {
            EVENT_LOG.info(this, "delete empty text");
            await editor.deleteBox(textBox);
        }
        LOGGER.log("END END text ["+ textOnScreen + "]");
        // await editor.selectElement(textBox.element, textBox.role, editor.selectedPosition);
    };

    afterUpdate(  () => {
        UPDATE_LOGGER.log("TextComponent After update [" + textOnScreen + "] caret [" + textBox.caretPosition + "]");
        textBox.update();
            textBox.setFocus = setFocus;
            textBox.setCaret = setCaret;

        LOGGER.log("after update: textbox with role " + textBox.role + " is now [" + textBox.getText() + "]")
        if( !!editor.selectedBox && !!textBox ) {
            if (editor.selectedBox.role === textBox.role && editor.selectedBox.element.piId() === textBox.element.piId()) {
                LOGGER.log("+++++++++++++++++++++++++++++++++++++++++++++ " + element);
                if(!!element) {
                    focus();
                    textBox.caretPosition = getCaretPosition();
                    caretPosition = textBox.caretPosition;
                    // setCaretPosition(textBox.caretPosition)
                }
            }
        }
    });

    const getCaretPosition = (): number => {
        // TODO This causes an extra afterUpdate in Svelte, don't know why !
        return window.getSelection().focusOffset;
        // return 0
    };

    autorun( () => {
        AUTO_LOGGER.log("AUTORUN role " + textBox.role + " text ["+ text + "] textOnScreen ["+ textOnScreen +"] textBox ["+ textBox.getText() + "]")
        text = textOnScreen;
        placeholder = textBox.placeHolder
        AUTO_LOGGER.log("==> selectedBox " + !!editor.selectedBox + " textBox" + !!textBox );
        if( !!editor.selectedBox && !!textBox ) {
            if (editor.selectedBox.role === textBox.role && editor.selectedBox.element.piId() === textBox.element.piId()) {
                AUTO_LOGGER.log("+++++++++++++++++++++++++++++++++++++++++++++ " + element);
                if(!!element) {
                    focus();
                }
            }
        }
    });
</script>

<div    class={"text"}
        data-placeholdertext={placeholder}
        on:keypress={onKeyPress}
        on:keydown={onKeyDown}
        on:click={onClick}
        on:input={onInput}
        contenteditable="true"
        bind:textContent={textOnScreen}
        bind:this={element} >
>
    {text}
</div>

<style>
    .text:empty:before {
        content: attr(data-placeholdertext);
        background-color: #f4f4f4;
    }

    .text {
        /*background-color: lightblue;*/
        padding: 3px;
        white-space: normal;
        display: inline-block;
    }
</style>
