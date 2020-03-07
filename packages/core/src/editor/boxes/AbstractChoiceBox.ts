import { PiKey } from "../../util/Keys";
import { PiCaret } from "../../util/BehaviorUtils";
import { Box } from "./Box";
import { PiElement } from "../../language/PiModel";
import { initializeObject } from "../../util/PiUtils";

export abstract class AbstractChoiceBox extends Box {
    kind = "AbstractChoiceBox";
    placeholder: string;
    caretPosition: number = -1;

    setCaret: (caret: PiCaret) => void = () => {
        /* To be overwritten by `TextComponent` */
    };

    /** @internal
     * This function is called after the text changes in the browser.
     * It ensures that the SelectableComponent will calculate the new coordinates.
     */
    update: () => void = () => {
        /* To be overwritten by `AliasComponent` */
    };

    /** @internal
     * Simulate a KeyBoard event
     */
    triggerKeyPressEvent: (key: string) => void = () => {
        /* To be overwritten by `AbstractChoiceComponent` */
    };

    /** @internal
     * Simulate a KeyBoard event
     */
    triggerKeyDownEvent: (key: PiKey) => void = () => {
        /* To be overwritten by `AbstractChoiceComponent` */
    };

    public deleteWhenEmpty1(): boolean {
        return false;
    }

    constructor(exp: PiElement, role: string, placeHolder: string, initializer?: Partial<AbstractChoiceBox>) {
        super(exp, role);
        this.placeholder = placeHolder;
        initializeObject(this, initializer);
    }

    isEditable(): boolean {
        return true;
    }
}
