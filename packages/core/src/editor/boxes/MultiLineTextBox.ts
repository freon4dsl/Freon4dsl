import type { FreNode } from "../../ast/index.js";
import { FREON } from "../../environment/index.js"
import { FreUtils } from "../../util/index.js";
import { Box } from "./Box.js";
import { FreLogger } from "../../logging/index.js";
import { FreCaret, FreCaretPosition } from "../util/index.js"

const LOGGER: FreLogger = new FreLogger("MultiLineTextBox").mute();

export class MultiLineTextBox extends Box {
    kind: string = "MultiLineTextBox"
    placeHolder: string = "type text"
    $getText: () => string
    $setText: (newValue: string) => void
    // If true, then this box should carry all error messages on the line.
    isFirstInLine: boolean = false
    caretPosition: number = -1

    /**
     * Run the setText() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setText(newValue: string): void {
        LOGGER.log("setText to " + newValue)
        FREON.astChanger.changeNamed("MultiLineTextBox.setText", () => {
            this.$setText(newValue)
        })
        this.isDirty()
    }

    getText(): string {
        return this.$getText()
    }

    constructor(node: FreNode, role: string, getText: () => string, setText: (text: string) => void, initializer?: Partial<MultiLineTextBox>) {
        super(node, role)
        FreUtils.initializeObject(this, initializer)
        this.$getText = getText
        this.$setText = setText
    }

    override isEditable(): boolean {
        return true
    }

    setCaret: (caret: FreCaret) => void = (caret: FreCaret) => {
        LOGGER.log("setCaret: " + caret.position)
        /* Default, to be overwritten by `TextComponent` */
        // TODO The following is needed to keep the cursor at the end when creating a numberliteral in example
        //     Check in new components whether this is needed.
        switch (caret.position) {
            case FreCaretPosition.RIGHT_MOST:
                this.caretPosition = this.getText().length
                break
            case FreCaretPosition.LEFT_MOST:
                this.caretPosition = 0
                break
            case FreCaretPosition.INDEX:
                this.caretPosition = caret.position
                break
            case FreCaretPosition.UNSPECIFIED:
                break
            default:
                break
        }
    }

    getCaret: () => FreCaret = (): FreCaret => {
        /* Default, to be overwritten by `TextComponent` */
        console.log("TextBox getCaret", FreCaret.LEFT_MOST.from)
        return FreCaret.LEFT_MOST
    }

    insertAtSelection: (insert: string) => void = (insert: string) => {
        // Default implementation, to be overridden by TextComponent
        let text = this.getText()
        let caret: FreCaret = this.getCaret()
        // Read and normalize selection
        let from = caret.from ?? 0
        let to = caret.to ?? from
        if (from > to) [from, to] = [to, from]

        // Clamp to current text
        const len = text?.length ?? 0
        from = Math.max(0, Math.min(from, len))
        to = Math.max(0, Math.min(to, len))

        // Splice in the new text
        const before = text.slice(0, from)
        const after = text.slice(to)
        text = before + insert + after

        // Collapse caret to end of inserted text
        const pos = from + insert.length
        caret.from = caret.to = pos

        LOGGER.log(`added ${insert} -> new caret at ${pos}`)
        this.setText(text)
        this.setFocus()
        // this.setCaret(caret)
    }

    getSelectedText: () => string = () => {
        // Default implementation, to be overridden by TextComponent
        let text = this.getText()
        let caret: FreCaret = this.getCaret()

        // Read and normalize selection
        let from = caret.from ?? 0
        let to = caret.to ?? from
        if (from > to) [from, to] = [to, from]

        // no selection → return empty
        if (from === to) {
            return ""
        }
        return text.substring(from, to)
    }

    deleteSelection: () => void = () => {
        // Default implementation, to be overridden by TextComponent
        let text: string = this.getText()
        let caret: FreCaret = this.getCaret()

        // normalize selection range
        let from: number = caret.from ?? 0
        let to: number = caret.to ?? from
        if (from > to) [from, to] = [to, from]

        const len = text.length
        if (from === to || len === 0) {
            // nothing selected, or empty text → nothing to delete
            return
        }

        // remove the selection
        const newText = text.substring(0, from) + text.substring(to)
        this.setText(newText)

        // collapse caret to the start of the former selection
        // this.setCaret({ position: FreCaretPosition.INDEX, from: from, to: from })
    }
}

export function isMultiLineTextBox(b: Box): b is MultiLineTextBox {
    return !!b && b.kind === "MultiLineTextBox";
}
