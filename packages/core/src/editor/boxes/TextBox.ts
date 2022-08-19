import { observable, action, makeObservable } from "mobx";
import { PiUtils } from "../../util";
import { PiCaret } from "../util";
import { PiElement } from "../../ast";
import { Box } from "./internal";
import { PiLogger } from "../../logging";

const LOGGER = new PiLogger("TextBox");

export enum KeyPressAction {
    OK,
    GOTO_NEXT,
    GOTO_PREVIOUS,
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
    caretPosition: number = -1;
    getText: () => string;
    private $setText: (newValue: string) => void;

    /**
     * Run the setText() as defined by the user of this box inside a mobx action.
     * @param newValue
     */
    setText(newValue: string): void {
        this.$setText(newValue);
    }

    keyPressAction: (currentText: string, key: string, index: number) => KeyPressAction = () => {
        return KeyPressAction.OK;
    };

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

    public deleteWhenEmpty1(): boolean {
        return this.deleteWhenEmpty;
    }

    // INTERNAL FUNCTIONS

    /** @internal
     */
    setCaret: (caret: PiCaret) => void = (caret: PiCaret) => {
        LOGGER.log("setCaret: " + caret.position);
        /* To be overwritten by `TextComponent` */
    };

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
