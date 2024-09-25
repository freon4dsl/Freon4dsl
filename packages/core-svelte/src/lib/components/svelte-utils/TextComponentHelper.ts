import {
    BACKSPACE,
    FreCaret,
    FreEditor,
    FreErrorSeverity,
    FreLogger,
    isActionBox,
    TextBox,
} from "@freon4dsl/core";
import { EventDispatcher } from "svelte";
import { executeCustomKeyboardShortCut } from "./CommonFunctions.js";

const LOGGER = new FreLogger("TextComponentHelper").mute();

export class TextComponentHelper {
    // The box that is shown in the text component for which this instance is created
    private readonly _myBox: TextBox;
    // Function that enables us to set the text variable in the TextComponent
    // private _setText: (val: string) => boolean;
    // Function that enables us to get the value from the text variable in the TextComponent
    private readonly _getText: () => string;
    // Function that enables us to do everything that is needed when the editing of the TextComponent is in any way stopped.
    private readonly _endEditing: () => void;
    // Function that enables us to ...
    // private readonly _textUpdateFunction: (p: { caret: number; content: string }) => boolean;
    private readonly _dispatcher: EventDispatcher<any>;

    // The cursor position, or when different from 'to', the start of the selected text.
    // Note that 'from <= to' always holds.
    _from: number = -1;
    // The cursor position, or when different from 'from', the end of the selected text.
    // Note that 'from <= to' always holds.
    _to: number = -1;
    
    constructor(box: TextBox,
                getText: () => string,
                endEditing: () => void,
                // textUpdateFunction: (p: { caret: number; content: string }) => boolean,
                dispatcher: EventDispatcher<any>
    ) {
        this._myBox = box;
        this._getText = getText;
        this._endEditing = endEditing;
        // this._textUpdateFunction = textUpdateFunction;
        this._dispatcher = dispatcher;
    }

    get to(): number {
        return this._to;
    }

    set to (val: number) {
        this._to = val;
    }

    get from(): number {
        return this._from;
    }

    set from (val: number) {
        this._from = val;
    }

    handleGoToPrevious(event: KeyboardEvent, editor: FreEditor, htmlId: string) {
        editor.selectPreviousLeaf();
        LOGGER.log(htmlId + "    PREVIOUS LEAF IS " + editor.selectedBox.role);
        if (isActionBox(editor.selectedBox)) {
            LOGGER.log("     is an action box");
            editor.selectedBox.triggerKeyPressEvent(event.key);
            editor.selectedBox.setCaret(FreCaret.RIGHT_MOST)
        }
        event.preventDefault();
        event.stopPropagation();
    }

    handleGoToNext(event: KeyboardEvent, editor: FreEditor, htmlId: string) {
        editor.selectNextLeaf();
        LOGGER.log(htmlId + "    NEXT LEAF IS " + editor.selectedBox.role);
        if (isActionBox(editor.selectedBox)) {
            LOGGER.log("     is an action box");
            editor.selectedBox.triggerKeyPressEvent(event.key);
            editor.selectedBox.setCaret(FreCaret.RIGHT_MOST)
        }
        event.preventDefault();
        event.stopPropagation();
    }

    handleCharAllowed(event: KeyboardEvent, caretFrom: number, editor: FreEditor, htmlId: string) {
        LOGGER.log('CharAllowed ' + JSON.stringify(event.key));
        if (this._myBox.kind === "ActionBox") {
            LOGGER.log(`${htmlId}: TEXT UPDATE text '${this._getText()}' key: '${event.key}' from: ${caretFrom}`)
            this._dispatcher('textUpdate', {content: this._getText().concat(event.key), caret: this._from - 1});
        }
        event.stopPropagation()
    }

    handleDelete(event: KeyboardEvent, editor: FreEditor) {
        LOGGER.log(`Delete`);
        if (!event.ctrlKey && !event.altKey && event.shiftKey) { // shift-delete
            // TODO CUT
        } else {
            event.stopPropagation();
            this.getCaretPosition(event);
            if (this._to !== this._getText().length) { // when there are still chars remaining to the right, do not let the parent handle it
                // without propagation, the browser handles which char(s) to be deleted
                // with event.ctrlKey: delete text from caret to 0 => handled by browser
                event.stopPropagation();
            } else if (this._getText() === "" || !this._getText()) { //  nothing left in this component to delete
                if (this._myBox.deleteWhenEmptyAndErase) {
                    editor.deleteBox(this._myBox);
                } else { // TODO is this correct?
                    // the key will cause this element to lose focus, its content should be saved
                    this._endEditing();
                    editor.selectNextLeaf();
                }
            }
        }
    }

    handleAltOrCtrlKey(event: KeyboardEvent, editor: FreEditor) {
        // see https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts
        LOGGER.log(`AltOrCtrlKey, key: ${JSON.stringify(event.key)}, ctrl: ${!!event.ctrlKey}, alt: ${!!event.altKey}`);
        // assert (event.altKey || event.ctrlKey)
        // first check if this event has a command defined for it
        executeCustomKeyboardShortCut(event, 0, this._myBox, editor); // this method will stop the event from propagating, but does not prevent default!!
        // next handle any key that should have a special effect within the text
        // todo see which of these can need not be handled here, and can bubble up to FreonComponent
        if (event.ctrlKey) {
            if (!event.altKey) {
                if (event.key === 'z') { // ctrl-z
                    // UNDO handled by browser
                } else if (event.key === 'h') { // ctrl-h
                    // todo SEARCH
                    event.stopPropagation();
                } else if (event.key === 'y') { // ctrl-y
                    // todo REDO
                    event.stopPropagation();
                } else if (event.key === 'x') { // ctrl-x
                    // todo CUT
                    event.stopPropagation();
                } else if (event.key === 'x') { // ctrl-a
                    // todo SELECT ALL in focused control
                    event.stopPropagation();
                } else if (event.key === 'c') { // ctrl-c
                    // COPY
                    event.stopPropagation();
                    navigator.clipboard.writeText(this._getText()) // TODO get only the selected text from document.getSelection
                        .then(() => {
                            editor.setUserMessage('Text copied to clipboard', FreErrorSeverity.Info);
                        })
                        .catch(err => {
                            editor.setUserMessage('Error in copying text: ' + err.message);
                        });
                } else if (event.key === 'v') { // ctrl-v
                    // PASTE
                    event.stopPropagation();
                    event.preventDefault(); // the default event causes extra <span> elements to be added

                    // clipboard.readText does not work in Firefox
                    // Firefox only supports reading the clipboard in browser extensions, using the "clipboardRead" extension permission.
                    // TODO add a check on the browser used
                    // navigator.clipboard.readText().then(
                    // 		clipText => LOGGER.log('adding ' + clipText + ' after ' + this._getText()[to - 1]));
                    // TODO add the clipText to 'text'
                }
            } else { // !!event.altKey
                if (event.key === 'z') { // ctrl-alt-z
                    // REDO handled by browser
                }
            }
        } else {
            if (event.altKey && event.key === BACKSPACE) { // alt-backspace
                // TODO UNDO
            } else if (!event.ctrlKey && event.altKey && event.shiftKey) { // alt-shift-backspace
                // TODO REDO
            }
        }

    }

    handleArrowLeft(event: KeyboardEvent) {
        this.getCaretPosition(event);
        LOGGER.log("Arrow-left: Caret at: " + this._from);
        if (this._from !== 0) { // when the arrow key can stay within the text, do not let the parent handle it
            event.stopPropagation();
            // note: caret is set to one less because getCaretPosition is calculated before the event is executed
            LOGGER.log('dispatching from arrow-left')
            this._dispatcher('textUpdate', {content: this._getText(), caret: this._from - 1});
        } else { // the key will cause this element to lose focus, its content should be saved
            this._endEditing();
            // let the parent take care of handling the event
        }
    }

    handleArrowRight(event: KeyboardEvent) {
        this.getCaretPosition(event);
        LOGGER.log("Arrow-right: Caret at: " + this._from);
        if (this._from !== this._getText().length) { // when the arrow key can stay within the text, do not let the parent handle it
            event.stopPropagation();
            // note: caret is set to one more because getCaretPosition is calculated before the event is executed
            LOGGER.log('dispatching from arrow-right')
            this._dispatcher('textUpdate', {content: this._getText(), caret: this._from + 1});
        } else { // the key will cause this element to lose focus, its content should be saved
            this._endEditing();
            // let the parent take care of handling the event
        }
    }

    handleBackSpace(event: KeyboardEvent, editor: FreEditor) {
        this.getCaretPosition(event);
        LOGGER.log("Caret at: " + this._from);
        if (this._from !== 0) { // When there are still chars remaining to the left, do not let the parent handle it.
            // Without propagation, the browser handles which char(s) to be deleted.
            // With event.ctrlKey: delete text from caret to end => handled by browser.
            event.stopPropagation();
        } else if (this._getText() === "" || !!this._getText()) { // nothing left in this component to delete
            if (this._myBox.deleteWhenEmptyAndErase) {
                editor.deleteBox(this._myBox);
                event.stopPropagation();
                // return;
            }
            editor.selectPreviousLeaf();
        } else {
            // the key will cause this element to lose focus, its content should be saved
            this._endEditing();
            editor.selectPreviousLeaf();
        }
    }



    /**
     * When a keyboard event is triggered, this function stores the caret position(s).
     * Note, this function is to be used from the <input> element only. It depends on the
     * fact that the event target has a 'selectionStart' and a 'selectionEnd', which is the case
     * only for <textarea> or <input> elements.
     * @param event
     */
    getCaretPosition(event: KeyboardEvent) {
        // the following type cast satisfies the type checking, as the event can only be generated from the <input> element
        const target = event.target as HTMLInputElement;
        this.setFromAndTo(target.selectionStart, target.selectionEnd);
    }

    /**
     * This function ensures that 'from <= to' always holds.
     * Should be called whenever these variables are set.
     * @param inFrom
     * @param inTo
     */
    setFromAndTo(inFrom: number, inTo: number) {
        if (inFrom < inTo) {
            this._from = inFrom;
            this._to = inTo;
        } else {
            this._from = inTo;
            this._to = inFrom;
        }
    }
}

