import { autorun } from 'mobx';
import { AST } from '../../change-manager/index.js';
import { FreUtils } from '../../util/index.js';
import { FreCaret, FreCaretPosition } from '../util/index.js';
import type { FreNode } from '../../ast/index.js';
import { Box } from './Box.js';
import { FreLogger } from '../../logging/index.js';

const LOGGER: FreLogger = new FreLogger("TextBox");

export enum CharAllowed {
    OK,
    GOTO_NEXT,
    GOTO_PREVIOUS,
    NOT_OK,
}

export class TextBox extends Box {
    kind: string = "TextBox";
    /**
     * If true, the element will be deleted when the text becomes
     * empty because of removing the last character in the text.
     * Usable for e.g. numeric values.
     */
    deleteWhenEmpty: boolean = false;

    /**
     * If true, delete element when Erase (delete, backspace, etc.) key is pressed while the element is empty.
     */
    deleteWhenEmptyAndErase: boolean = false;

    // If true, then this box should carry all error messages on the line.
    isFirstInLine: boolean = false;

    placeHolder: string = "";
    caretPosition: number = -1;
    $_getText: () => string;
    $setText: (newValue: string) => void;

    /**
     * Run the setText() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setText(newValue: string): void {
        LOGGER.log("setText to " + newValue);
        AST.changeNamed("TextBox.setText", () => {
            this.$setText(newValue);
        })
        this.isDirty();
    }

    getText(): string {
        return this.$_getText();
    }
    
    set $getText( value: () => string ) {
        const oldvalue = this.$_getText()
        this.$_getText = value;
        autorun( () => {
            const newvalue = this.$_getText()
            LOGGER.log(`old '${oldvalue}'  new '${newvalue}'`)
            this.isDirty()
        })
    }

    isCharAllowed: (currentText: string, key: string, index: number) => CharAllowed = () => {
        return CharAllowed.OK;
    };

    constructor(
        node: FreNode,
        role: string,
        getText: () => string,
        setText: (text: string) => void,
        initializer?: Partial<TextBox>,
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$_getText = getText;
        this.$setText = setText;
    }



    // INTERNAL FUNCTIONS

    /** @internal
     */
    setCaret: (caret: FreCaret) => void = (caret: FreCaret) => {
        LOGGER.log("setCaret: " + caret.position);
        /* Default, to be overwritten by `TextComponent` */
        // TODO The following is needed to keep the cursor at the end when creating a numberliteral in example
        //     Check in new components whether this is needed.
        switch (caret.position) {
            case FreCaretPosition.RIGHT_MOST:
                this.caretPosition = this.getText().length;
                break;
            case FreCaretPosition.LEFT_MOST:
                this.caretPosition = 0;
                break;
            case FreCaretPosition.INDEX:
                this.caretPosition = caret.position;
                break;
            case FreCaretPosition.UNSPECIFIED:
                break;
            default:
                break;
        }
    };

    getCaret: () => FreCaret = (): FreCaret => {
        /* Default, to be overwritten by `TextComponent` */
        console.log('TextBox getCaret', FreCaret.LEFT_MOST.from);
        return FreCaret.LEFT_MOST;
    }

    insertAtSelection(insert: string) {
        let text = this.getText();
        let caret: FreCaret = this.getCaret();
        // Read and normalize selection
        let from = caret.from ?? 0;
        let to   = caret.to   ?? from;
        if (from > to) [from, to] = [to, from];

        // Clamp to current text
        const len = text?.length ?? 0;
        from = Math.max(0, Math.min(from, len));
        to   = Math.max(0, Math.min(to,   len));

        // Splice in the new text
        const before = text.slice(0, from);
        const after  = text.slice(to);
        text = before + insert + after;

        // Collapse caret to end of inserted text
        const pos = from + insert.length;
        caret.from = caret.to = pos;

        LOGGER.log(`added ${insert} -> new caret at ${pos}`);
        this.setText(text);
    }

    getSelectedText() : string {
        let text = this.getText();
        let caret: FreCaret = this.getCaret();

        // Read and normalize selection
        let from = caret.from ?? 0;
        let to   = caret.to   ?? from;
        if (from > to) [from, to] = [to, from];

        // no selection → return empty
        if (from === to) {
            return '';
        }
        return text.substring(from, to);
    }

    deleteSelection(): void {
        let text: string = this.getText();
        let caret: FreCaret = this.getCaret();

        // normalize selection range
        let from: number = caret.from ?? 0;
        let to: number = caret.to ?? from;
        if (from > to) [from, to] = [to, from];

        const len = text.length;
        if (from === to || len === 0) {
            // nothing selected, or empty text → nothing to delete
            return;
        }

        // remove the selection
        const newText = text.substring(0, from) + text.substring(to);
        this.setText(newText);

        // collapse caret to the start of the former selection
        this.setCaret({position: FreCaretPosition.INDEX, from: from, to: from });
    }

    /** @internal
     * This function is called after the text changes in the browser.
     * It ensures that the SelectableComponent will calculate the new coordinates.
     */
    update: () => void = () => {
        /* To be overwritten by `TextComponent` */
    };

    isEditable(): boolean {
        return true;
    }
}

export function isTextBox(b: Box): b is TextBox {
    return !!b && b.kind === "TextBox"; // b instanceof TextBox;
}
