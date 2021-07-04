import { observable } from "mobx";
import { SBox } from "./SBox";

export class STextBox extends SBox {
    kind = "TextBox";
    @observable placeHolder: string = "<text>";
    getText: () => string = () => { return this.text; };
    setText: (newValue: string) => void  = (value: string) => { this.text = value; };

    text: string = ""; // TODO for now

    constructor(value: string) {
        super();
        this.text = value;
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

export function isTextBox(b: SBox): b is STextBox {
    return b instanceof STextBox;
}
