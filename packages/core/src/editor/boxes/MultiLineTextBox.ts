import { FreNode } from "../../ast/index.js";
import { AST } from "../../change-manager/index.js";
import { FreUtils } from "../../util/index.js";
import { Box } from "./Box.js";
import { FreLogger } from "../../logging/index.js";

const LOGGER: FreLogger = new FreLogger("MultiLineTextBox").mute();

export class MultiLineTextBox extends Box {
    kind: string = "MultiLineTextBox";
    placeHolder: string = "type text";
    $getText: () => string;
    $setText: (newValue: string) => void;

    /**
     * Run the setText() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setText(newValue: string): void {
        LOGGER.log("setText to " + newValue);
        AST.changeNamed("MultiLineTextBox.setText", () => {
            this.$setText(newValue);
        })
        this.isDirty();
    }

    getText(): string {
        return this.$getText();
    }

    constructor(
        node: FreNode,
        role: string,
        getText: () => string,
        setText: (text: string) => void,
        initializer?: Partial<MultiLineTextBox>,
    ) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.$getText = getText;
        this.$setText = setText;
    }

    override isEditable(): boolean {
        return true;
    }
}

export function isMultiLineTextBox(b: Box): b is MultiLineTextBox {
    return !!b && b.kind === "MultiLineTextBox";
}
