import { makeObservable, observable } from "mobx";
import { PiElement } from "../../language";
import { BehaviorExecutionResult, PiCaret, PiKey, PiUtils } from "../../util";
import { BoxFactory, PiEditor } from "../internal";
import { Box, ChoiceTextHelper, SelectOption, TextBox } from "./internal";

export abstract class AbstractChoiceBox extends Box {
    kind = "AbstractChoiceBox";
    placeholder: string;
    caretPosition: number = -1;
    textBox: TextBox;
    textHelper: ChoiceTextHelper;
    getSelectedOption(): SelectOption | null { return null; };
    getOptions(editor: PiEditor): SelectOption[] { return [] };

    constructor(exp: PiElement, role: string, placeHolder: string, initializer?: Partial<AbstractChoiceBox>) {
        super(exp, role);
        this.placeholder = placeHolder;
        this.textHelper = new ChoiceTextHelper();
        makeObservable(this, {
            textHelper: observable
        });
        PiUtils.initializeObject(this, initializer);
        this.textBox = BoxFactory.text(
            exp,
            "alias-" + role + "-textbox",
            () => {
                /* To be overwritten by `SelectComponent` */
                return this.textHelper.getText();
            },
            (value: string) => {
                /* To be overwritten by `SelectComponent` */
                this.textHelper.setText(value);
            },
            {
                parent: this,
                selectable: false,
                placeHolder: placeHolder
            }
        );
    }



    async selectOption(editor: PiEditor, option: SelectOption): Promise<BehaviorExecutionResult> {
        console.error("AbstractChoiceBox.selectOption")
        return BehaviorExecutionResult.NULL;
    };

    setCaret: (caret: PiCaret) => void = (caret: PiCaret) => {
        if( !!this.textBox) {
            this.textBox.setCaret(caret);
        }
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

    isEditable(): boolean {
        return true;
    }
}
