import { observable, action, makeObservable } from "mobx";
import { PiUtils } from "../../util";
import { PiElement } from "../../ast";
import { Box } from "./internal";
import { PiLogger } from "../../logging";
import { PiCaret } from "../PiCaret";

const LOGGER = new PiLogger("TextBox");

export enum CharAllowed {
    OK,
    GOTO_NEXT,
    NOT_OK
}

export class TextBox extends Box {
    kind = "TextBox";
    /**
     * If true, the element will be deleted when the text becomes
     * empty because of removing the last character in the text.
     * Usable for e.g. numeric values.
     */
    deleteWhenEmpty: boolean = false;

    /**
     * If true, delete element when Erase key is pressed while the element is empty.
     */
    deleteWhenEmptyAndErase: boolean = false;

    placeHolder: string = "";
    getText: () => string;
    private $setText: (newValue: string) => void;

    constructor(exp: PiElement, role: string, getText: () => string, setText: (text: string) => void, initializer?: Partial<TextBox>) {
        super(exp, role);
        PiUtils.initializeObject(this, initializer);
        this.getText = getText;
        this.$setText = setText;
        makeObservable(this, {
            placeHolder: observable,
            setText: action
        });
    }

    /**
     * Run the setText() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setText(newValue: string): void {
        this.$setText(newValue);
    }

    isCharAllowed: (char: string) => CharAllowed = () => {
        return CharAllowed.OK;
    };

    isEditable(): boolean {
        return true;
    }

    // INTERNAL FUNCTIONS

    /** @internal
     */
    setCaret: (caret: PiCaret) => void = (caret: PiCaret) => {
        LOGGER.log("setCaret: " + caret.position);
        /* To be overwritten by `TextComponent` */
    };
}

export function isTextBox(b: Box): b is TextBox {
    return !!b && b.kind === "TextBox"; // b instanceof TextBox;
}
