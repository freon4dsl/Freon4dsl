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
    // The dispatcher that enables us to communicate with the surrounding TextDropdownComponent
    private readonly _dispatcher: EventDispatcher<any>;
    // Indicates whether the text component is part of a TextDropdownComponent
    private _isPartOfDropdown: boolean = false;

    // The cursor position, or when different from 'to', the start of the selected text.
    // Note that 'from <= to' always holds.
    _from: number = -1;
    // The cursor position, or when different from 'from', the end of the selected text.
    // Note that 'from <= to' always holds.
    _to: number = -1;

    constructor(box: TextBox,
                isPartOfDropdown,
                getText: () => string,
                endEditing: () => void,
                // textUpdateFunction: (p: { caret: number; content: string }) => boolean,
                dispatcher: EventDispatcher<any>
    ) {
        this._myBox = box;
        this._isPartOfDropdown = isPartOfDropdown;
        this._getText = getText;
        this._endEditing = endEditing;
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


    handleDelete(event: KeyboardEvent, editor: FreEditor) {
        LOGGER.log(`Delete`);
        if (!event.ctrlKey && !event.altKey && event.shiftKey) { // shift-delete
            // TODO CUT
        } else {
            this._dispatcher('showDropdown');
            this.getCaretPosition(event);
            let endPosition: number = this._getText().length;
            // todo this code is the same as in handleBackspace, make it a private method
            // for now: the console messages make clearer what is happening
            if (this._from < endPosition || (this._from !== this._to)) { // some chars remain at the right, or several chars are selected
                console.log(`handleDelete, caret: ${this._from}-${this._to}`);
                // Without propagation but with event Default, the browser handles which char(s) to be deleted.
                // With event.ctrlKey: delete text from caret to start, is also handled by the browser.
                event.stopPropagation();
                // If needed, the afterUpdate function dispatches a 'textUpdate' to the parent TextDropdownComponent
            } else { // nothing left in this component to delete at the right
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    handleBackSpace(event: KeyboardEvent, editor: FreEditor) {
        this._dispatcher('showDropdown');
        this.getCaretPosition(event);
        let endPosition: number = 0;
        // todo this code is the same as in handleDelete, make it a private method
        // for now: the console messages make clearer what is happening
        if (this._from > endPosition || (this._from !== this._to)) { // some chars remain at the left, or several chars are selected
            console.log(`handleBackSpace, caret: ${this._from}-${this._to}`);
            // Without propagation but with event Default, the browser handles which char(s) to be deleted.
            // With event.ctrlKey: delete text from caret to start, is also handled by the browser.
            event.stopPropagation();
            // If needed, the afterUpdate function dispatches a 'textUpdate' to the parent TextDropdownComponent
        } else { // nothing left in this component to delete at the left
            event.preventDefault();
            event.stopPropagation();
        }
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
            // editor.selectedBox.execute(event.key)
            // editor.selectedBox.setText(key)
            LOGGER.log("     is an action box");
            editor.selectedBox.triggerKeyPressEvent(event.key);
            editor.selectedBox.setCaret(FreCaret.RIGHT_MOST)
            editor.selectedCaretPosition = FreCaret.RIGHT_MOST
        }
        event.preventDefault();
        event.stopPropagation();
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
        this._dispatcher('showDropdown');
        this.getCaretPosition(event);
        console.log(`handleArrowLeft, caret: ${this._from}-${this._to}`);
        if (this._from !== 0) { // when the arrow key can stay within the text, do not let the parent handle it
            event.stopPropagation();
            // note: caret is set to one less because getCaretPosition is calculated before the event is executed
            this._from -= 1;
            this._to -= 1;
            console.log(`textUpdate from handleArrowLeft`)
            this._dispatcher('textUpdate', {content: this._getText(), caret: this._from});
        } else { // the key will cause this element to lose focus, its content should be saved
            this._endEditing();
            // let the parent take care of handling the event
        }
    }

    handleArrowRight(event: KeyboardEvent) {
        this._dispatcher('showDropdown');
        this.getCaretPosition(event);
        console.log(`handleArrowRight, caret: ${this._from}-${this._to}`);
        if (this._from !== this._getText().length) { // when the arrow key can stay within the text, do not let the parent handle it
            event.stopPropagation();
            // note: caret is set to one more because getCaretPosition is calculated before the event is executed
            this._from =+ 1;
            this._to =+ 1;
            console.log(`textUpdate from handleArrowLeft`)
            this._dispatcher('textUpdate', {content: this._getText(), caret: this._from});
        } else { // the key will cause this element to lose focus, its content should be saved
            this._endEditing();
            // let the parent take care of handling the event
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

    isTextEmpty(): boolean {
        return this._getText() === "" || !this._getText();
    }
}

