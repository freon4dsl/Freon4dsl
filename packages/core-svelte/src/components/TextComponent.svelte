<svelte:options accessors={true}/>

<script lang="ts">
    import { autorun } from "mobx";
    import {
        ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT,
        ARROW_UP,
        BACKSPACE,
        DELETE, ENTER,
        EVENT_LOG,
        TAB,
        isAliasBox,
        isMetaKey,
        KeyPressAction, PiUtils,
        TextBox,
        PiEditor,
        toPiKey,
        wait, PiCaret, PiCaretPosition, PiLogger, SPACEBAR, isPrintable
    } from "@projectit/core";
    import { afterUpdate, beforeUpdate, onMount } from "svelte";
    import { AUTO_LOGGER, UPDATE_LOGGER } from "./ChangeNotifier";

    export let textBox = new TextBox(null, "role:", () => "Editable textbox", (v: string) => {});
    export let editor: PiEditor;

    const LOGGER = new PiLogger("TextComponent");//.mute();
    export let textOnScreen: string;
    let caretPosition: number = 0;

    export let getText = (): string => {
        // TODO loopt eentje achter tijdens onKeyDown
        return textOnScreen;
    }

    const setFocus = async (): Promise<void> => {
        LOGGER.log("TextComponent set focus " + textBox.role);
        element.focus();
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
        return e.keyCode === ENTER || e.keyCode === TAB;
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
            if (e.keyCode === ARROW_UP || e.keyCode === ARROW_DOWN || e.keyCode === TAB || e.keyCode === SPACEBAR) {
                return true;
            }
        }
        if (e.keyCode === ENTER || e.keyCode === DELETE || e.keyCode === TAB) {
            return true;
        }
        if (e.keyCode === ARROW_UP || e.keyCode === ARROW_DOWN) {
            return true;
        }
        const caretPosition = getCaretPosition();
        if (e.keyCode === ARROW_LEFT || e.keyCode === BACKSPACE) {
            return caretPosition <= 0;
        } else if (e.keyCode === ARROW_RIGHT || e.keyCode === DELETE) {
            return caretPosition >= textOnScreen.length;
        } else {
            return false;
        }
    };

    onMount( () => {
        LOGGER.log("TextComponent.onMoiunt for role ["+ textBox.role + "]")
        textBox.setFocus = setFocus;
        // textBox.setCaret = setCaret;
        caretPosition = textBox.caretPosition;
    });

    const onKeyDown = async (event: KeyboardEvent) => {
        LOGGER.log("TextComponent.onKeyDown: "+ event.key + " alt " + event.ctrlKey+  "]");
        let handled: boolean = false;
        // const caretPosition = getCaretPosition();
        if (event.keyCode === DELETE) {
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
        if (event.keyCode === BACKSPACE) {
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
        } else {
            // E.g. for all printable keys.
            handled = true;
        }
        const piKey = toPiKey(event);
        if (!handled && !isMetaKey(event)) {
            const isKeyboardShortcutForThis = await PiUtils.handleKeyboardShortcut(piKey, textBox, editor);
            if (!isKeyboardShortcutForThis) {
                LOGGER.log("Key not handled for element " + textBox.element);
                if(event.keyCode === ENTER){
                    LOGGER.log("   ENTER, so propagate");
                    return;
                }
                // Try the key on next box, if at the end of this box.
                // const insertionIndex = getCaretPosition();
                // if (insertionIndex >= textBox.getText().length) {
                //     editor.selectNextLeaf();
                //     EVENT_LOG.log("KeyDownAction NEXT LEAF IS " + editor.selectedBox.role);
                //     if (isAliasBox(editor.selectedBox)) {
                //         editor.selectedBox.triggerKeyDownEvent(piKey);
                //     }
                //     event.preventDefault();
                //     event.stopPropagation();
                // }
            }
        }
    };

    const setCaret = (caret: PiCaret) => {
        switch (caret.position) {
            case PiCaretPosition.RIGHT_MOST:
                LOGGER.log("setCaretPosition RIGHT");
                setCaretToMostRight();
                break;
            case PiCaretPosition.LEFT_MOST:
                LOGGER.log("setCaretPosition LEFT");
                setCaretToMostLeft();
                break;
            case PiCaretPosition.INDEX:
                LOGGER.log("setCaretPosition INDEX");
                setCaretPosition(caret.index);
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
        LOGGER.log("TextComponent.setCaretPosition: " + position);
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
                console.log("ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR; ");
                console.log("TextComponent.setCaretPosition >length: " + position + " > " + textOnScreen.length);
                // position = this.element.innerText.length;
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
            console.log("TextComponent.setCaretPosition ERROR: " + e.toString());
        }
    };

    const clearSelection = () => {
        window.getSelection().removeAllRanges();
    };

    const onClick = (event: MouseEvent) => {
        // textBox.caretPosition = getCaretPosition();
    }

    const onKeyPress = async (event: KeyboardEvent) => {
        LOGGER.log("TextComponent.onKeyPress: " + event.key);// + " text binding [" + textOnScreen + "] w: " + textBox.actualWidth);
        const insertionIndex = 0; // TODO getCaretPosition();
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
        LOGGER.log("onInput `" + e.data + ":  textOnScreen [" + textOnScreen + "] box text ["+ textBox.getText() + "]");
        // textBox.caretPosition = getCaretPosition();
        // caretPosition = textBox.caretPosition;
        // editor.selectedPosition = PiCaret.IndexPosition(textBox.caretPosition);
        if (textBox.deleteWhenEmpty && textBox.getText().length === 0) {
            EVENT_LOG.info(this, "delete empty text");
            editor.deleteBox(textBox);
        }
        LOGGER.log("END END text ["+ textOnScreen + "]");
        // await editor.selectElement(textBox.element, textBox.role, editor.selectedPosition);
    };

    afterUpdate(  () => {
        UPDATE_LOGGER.log("TextComponent After update [" + textOnScreen + "] caret [" + textBox.caretPosition + "]");
        textBox.update();
            textBox.setFocus = setFocus;
            LOGGER.log("textbox is now [" + textBox.getText() + "]")
    });

    const getCaretPosition = (): number => {
        // TODO This causes an extra afterUpdate in Svelte, don't know why !
        return window.getSelection().focusOffset;
        // return 0
    };

    autorun( () => {
        // LOGGER.log("AUTO start text ["+ text + "] textOnScreen ["+ textOnScreen +"] textBox ["+ textBox.getText() + "]")
        text = textOnScreen;
        // textOnScreen = text;
        // AUTO_LOGGER.log("AUTO TEXT COMPONENT ["+ text + "]")
        placeholder = textBox.placeHolder
    });
</script>

<div    style="{textBox.style}"
        class={"text"}
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
