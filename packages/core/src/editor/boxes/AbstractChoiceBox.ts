import { FreNode } from "../../ast";
import { FreUtils } from "../../util";
import { BehaviorExecutionResult, FreCaret, FreKey } from "../util";
import { BoxFactory, FreEditor } from "../internal";
import { Box, ChoiceTextHelper, SelectOption, TextBox } from "./internal";

export abstract class AbstractChoiceBox extends Box {
    kind = "AbstractChoiceBox";
    placeholder: string;
    caretPosition: number = -1;
    _textBox: TextBox;
    textHelper: ChoiceTextHelper;

    constructor(exp: FreNode, role: string, placeHolder: string, initializer?: Partial<AbstractChoiceBox>) {
        super(exp, role);
        this.placeholder = placeHolder;
        this.textHelper = new ChoiceTextHelper();
        FreUtils.initializeObject(this, initializer);
        this._textBox = BoxFactory.text(
            exp,
            "action-" + role + "-textbox",
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
                selectable: true,
                placeHolder: placeHolder
            }
        );
    }

    get textBox(): TextBox {
        // TODO Does this need to be done every time the textbox is requested?
        //      Or could this move to the constructor?
        this._textBox.propertyName = this.propertyName;
        this._textBox.propertyIndex = this.propertyIndex;
        return this._textBox;
    }

    getSelectedOption(): SelectOption | null {
        return null;
    }

    getOptions(editor: FreEditor): SelectOption[] {
        return [];
    }

    selectOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        console.error("AbstractChoiceBox.selectOption");
        return BehaviorExecutionResult.NULL;
    };

    setCaret: (caret: FreCaret) => void = (caret: FreCaret) => {
        if (!!this.textBox) {
            this.textBox.setCaret(caret);
        }
    };

    /** @internal
     * This function is called after the text changes in the browser.
     * It ensures that the SelectableComponent will calculate the new coordinates.
     */
    update: () => void = () => {
        /* To be overwritten by `ActionComponent` */
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
    triggerKeyDownEvent: (key: FreKey) => void = () => {
        /* To be overwritten by `AbstractChoiceComponent` */
    };

    public deleteWhenEmpty1(): boolean {
        return false;
    }

    isEditable(): boolean {
        return true;
    }
}
