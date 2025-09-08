import {
    ActionBox,
    BACKSPACE,
    BehaviorExecutionResult,
    FreCaret,
    FreEditor,
    FreErrorSeverity,
    FreLogger,
    isActionTextBox,
    jsonAsString,
    notNullOrUndefined,
    SPACEBAR,
    TextBox
} from '@freon4dsl/core';
import { executeCustomKeyboardShortCut } from './CommonFunctions.js';
import { shouldBeHandledByBrowser } from '../stores/AllStores.svelte.js';
import type { CaretDetails } from './CaretDetails';

const LOGGER = new FreLogger('TextComponentHelper');

export class TextComponentHelper {
    // The box that is shown in the text component for which this instance is created
    private readonly _myBox: TextBox;
    // Function that enables us to get the value from the text variable in the TextComponent
    private readonly _getText: () => string;
    // Function that enables us to determine whether the text variable in the TextComponent is different from the value stored in the model
    private readonly _hasChanges: () => boolean;
    // Function that enables us to do everything that is needed when the editing of the TextComponent is in any way stopped.
    private readonly _endEditing: () => void;
    // The dispatcher that enables us to communicate with the surrounding TextDropdownComponent
    private readonly _dispatcher: (eventType: string, details?: CaretDetails) => void;

    // The cursor position, or when different from 'to', the start of the selected text.
    // Note that 'from <= to' always holds.
    _from: number = -1;
    // The cursor position, or when different from 'from', the end of the selected text.
    // Note that 'from <= to' always holds.
    _to: number = -1;

    constructor(
        box: TextBox,
        getText: () => string,
        hasChanges: () => boolean,
        endEditing: () => void,
        dispatcher: (eventType: string, details?: CaretDetails) => void
    ) {
        this._myBox = box;
        this._getText = getText;
        this._hasChanges = hasChanges;
        this._endEditing = endEditing;
        this._dispatcher = dispatcher;
    }

    get to(): number {
        return this._to;
    }

    set to(val: number) {
        this._to = val;
    }

    get from(): number {
        return this._from;
    }

    set from(val: number) {
        this._from = val;
    }

    // leaving the param because we might need it later
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handleDelete(event: KeyboardEvent, editor: FreEditor) {
        LOGGER.log(`Delete`);
        if (!event.ctrlKey && !event.altKey && event.shiftKey) {
            // shift-delete
            this.cut();
        } else {
            this._dispatcher('showDropdown');
            this.getCaretPosition(event);
            if (this._from < this._getText().length || this._from !== this._to) {
                // some chars remain at the right, or several chars are selected
                // No need to adjust the caret position, the char will be deleted *after* the caret
                LOGGER.log(`handleDelete, caret: ${this._from}-${this._to}`);
                // Without propagation but with event Default, the browser handles which char(s) to be deleted.
                // With event.ctrlKey: delete text from caret to start, is also handled by the browser.
                event.stopPropagation();
                // If needed, the afterUpdate function dispatches a 'textUpdate' to the parent TextDropdownComponent
            } else {
                // nothing left in this component to delete at the right
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    handleBackSpace(event: KeyboardEvent, editor: FreEditor) {
        LOGGER.log(`handleBackSpace`);
        this.getCaretPosition(event);
        if (this._from > 0 || this._from !== this._to) {
            // some chars remain at the left, or several chars are selected
            if (this._from === this._to) {
                // Adjust the caret position to take into account the deleted char, because it is *before* the current caret
                this._from -= 1;
                this._to -= 1;
            } // else: the deleted chars are *after* this._from, therefore no need to adjust the caret.
            LOGGER.log(`handleBackSpace, caret: ${this._from}-${this._to}`);
            // Without propagation but with event Default, the browser handles which char(s) to be deleted.
            // With event.ctrlKey: delete text from caret to start, is also handled by the browser.
            event.stopPropagation();
            // If needed, the afterUpdate function dispatches a 'textUpdate' to the parent TextDropdownComponent
        } else {
            // nothing left in this component to delete at the left
            if (this.isTextEmpty()) {
                // Needed  if the textbox was already empty before entering
                LOGGER.log(
                    '    handleBackSpace EMPTY EMPTY EMPTY EMPTY EMPTY EMPTY EMPTY EMPTY ' +
                        this._myBox.kind +
                        ' id ' +
                        this._myBox.$id
                );
                editor.deleteTextBox(this._myBox, true);
            }
            event.preventDefault();
            event.stopPropagation();
        }
    }

    handleGoToPrevious(event: KeyboardEvent, editor: FreEditor, htmlId: string) {
        LOGGER.log('handleGoToPrevious event ' + event.key);
        this._endEditing();
        editor.selectPreviousLeafIncludingExpressionPreOrPost();
        LOGGER.log(htmlId + '    PREVIOUS LEAF IS ' + editor.selectedBox.role);
        if (isActionTextBox(editor.selectedBox)) {
            const actionBox = (editor.selectedBox as TextBox).parent as ActionBox;
            const executionResult: BehaviorExecutionResult = actionBox.tryToExecute(
                event.key,
                editor
            );
            if (executionResult !== BehaviorExecutionResult.EXECUTED) {
                actionBox.setCaret(FreCaret.LEFT_MOST, editor);
            }
        }
        event.preventDefault();
        event.stopPropagation();
    }

    handleGoToNext(event: KeyboardEvent, editor: FreEditor, htmlId: string) {
        LOGGER.log('handleGoToNext event ' + event.key);
        this._endEditing();
        editor.selectNextLeafIncludingExpressionPreOrPost();
        LOGGER.log(htmlId + '    NEXT LEAF IS ' + editor.selectedBox.role);
        if (isActionTextBox(editor.selectedBox)) {
            const actionBox = (editor.selectedBox as TextBox).parent as ActionBox;
            const executionResult: BehaviorExecutionResult = actionBox.tryToExecute(
                event.key,
                editor
            );
            if (executionResult !== BehaviorExecutionResult.EXECUTED) {
                actionBox.setCaret(FreCaret.RIGHT_MOST, editor);
            }
        }
        event.preventDefault();
        event.stopPropagation();
    }

    handleAltOrCtrlKey(event: KeyboardEvent, editor: FreEditor) {
        // see https://en.wikipedia.org/wiki/Table_of_keyboard_shortcuts
        LOGGER.log(
            `AltOrCtrlKey, key: ${jsonAsString(event.key)}, ctrl: ${event.ctrlKey}, alt: ${event.altKey}`
        );
        // assert (event.altKey || event.ctrlKey)
        // first check if this event has a command defined for it
        executeCustomKeyboardShortCut(event, 0, this._myBox, editor); // this method will stop the event from propagating, but does not prevent default!!
        // next handle any key that should have a special effect within the text
        this.getCaretPosition(event);
        // see which of these need to be handled here, and which can bubble up to FreonComponent or to the browser
        if (event.ctrlKey) {
            if (!event.altKey) {
                switch (event.key) {
                    case 'z': // ctrl-z
                    case 'y': // ctrl-y
                        shouldBeHandledByBrowser.value = this._hasChanges();
                        this._dispatcher("hideDropdown")
                        break;
                    case 'x': // ctrl-x
                        LOGGER.log('TextComponentHelper cut')
                        this.cut();
                        break;
                    case 'a': // ctrl-a
                        // todo SELECT ALL in focused control
                        break;
                    case 'c': // ctrl-c
                        LOGGER.log('TextComponentHelper copy')
                        this.copy(event, editor);
                        break;
                    case 'v': // ctrl-v
                        LOGGER.log('TextComponentHelper paste')
                        this.paste(event);
                        break;
                    case SPACEBAR:
                        LOGGER.log('TextComponentHelper startEditing')
                        this._dispatcher("startEditing")
                        break;
                }
            } else {
                // !!event.altKey
                if (event.key === 'z') {
                    // ctrl-alt-z
                    shouldBeHandledByBrowser.value = this._hasChanges();
                }
            }
        } else {
            if (event.altKey && event.key === BACKSPACE) {
                // alt-backspace
                shouldBeHandledByBrowser.value = this._hasChanges();
            } else if (!event.ctrlKey && event.altKey && event.shiftKey) {
                // alt-shift-backspace
                shouldBeHandledByBrowser.value = this._hasChanges();
            }
        }
    }

    handleArrowLeft(event: KeyboardEvent) {
        this.getCaretPosition(event)
        LOGGER.log(`handleArrowLeft, caret: ${this._from}-${this._to}`)
        if (this._from !== 0) {
            // when the arrow key can stay within the text, do not let the parent handle it
            event.stopPropagation();
            // note: caret is set to one less because getCaretPosition is calculated before the event is executed
            this._from -= 1
            this._to -= 1
            LOGGER.log(`caretChanged from handleArrowLeft, caret: ${this._from}-${this._to}`)
            this._dispatcher("caretChanged", { content: this._getText(), caret: this._from })
        }
    }

    handleArrowRight(event: KeyboardEvent) {
        this.getCaretPosition(event)
        LOGGER.log(`handleArrowRight, caret: ${this._from}-${this._to}`)
        if (this._from !== this._getText().length) {
            // when the arrow key can stay within the text, do not let the parent handle it
            event.stopPropagation();
            // note: caret is set to one more because getCaretPosition is calculated before the event is executed
            this._from += 1
            this._to += 1
            LOGGER.log(`caretChanged from handleArrowLeft, caret: ${this._from}-${this._to}`)
            this._dispatcher("caretChanged", { content: this._getText(), caret: this._from })
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
        LOGGER.log(`getCaretPosition ${target.selectionStart} - ${target.selectionEnd}`)
        this.setFromAndTo(target.selectionStart, target.selectionEnd);
    }

    /**
     * This function ensures that 'from <= to' always holds.
     * Should be called whenever these variables are set.
     * @param inFrom
     * @param inTo
     */
    setFromAndTo(inFrom: number | undefined | null, inTo: number | undefined | null) {
        if (notNullOrUndefined(inFrom) && notNullOrUndefined(inTo)) {
            if ((inFrom as number) < (inTo as number)) {
                this._from = inFrom as number;
                this._to = inTo as number;
            } else {
                this._from = inTo as number;
                this._to = inFrom as number;
            }
        } else {
            this._from = 0;
            this._to = 0;
        }
    }

    isTextEmpty(): boolean {
        return this._getText() === '' || !this._getText();
    }

    /**
     * This function determines where the current keystroke event should be handled.
     * It is used for keystrokes that are not directly handled by the corresponding TextComponent,
     * but are either handled by the browser, e.g. an undo in the input text, or by the surrounding
     * FreonComponent, e.g. an undo when there are no changes in the input text left that could be undone.
     * @private
     */

    /**
     * Like setHandler(), this function determines where the current keystroke event should be handled.
     * However, the condition for the choice is a different one.
     * @private
     */
    private cut() {
        if (this._from !== this._to) {
            // handled by browser
            shouldBeHandledByBrowser.value = true;
        } else {
            // handled by FreonComponent
            shouldBeHandledByBrowser.value = false;
        }
    }

    private paste(event: KeyboardEvent) {
        event.stopPropagation();
        event.preventDefault(); // the default event causes extra <span> elements to be added

        // clipboard.readText does not work in Firefox
        // Firefox only supports reading the clipboard in browser extensions, using the "clipboardRead" extension permission.
        // TODO add a check on the browser used
        // navigator.clipboard.readText().then(
        // 		clipText => LOGGER.log('adding ' + clipText + ' after ' + this._getText()[this._to - 1]));
        // TODO add the clipText to 'text'
    }

    private copy(event: KeyboardEvent, editor: FreEditor) {
        event.stopPropagation();
        navigator.clipboard
            .writeText(this._getText()) // TODO get only the selected text from document.getSelection
            .then(() => {
                editor.setUserMessage('Text copied to clipboard', FreErrorSeverity.Info);
            })
            .catch((err) => {
                editor.setUserMessage('Error in copying text: ' + err.message);
            });
    }
}
