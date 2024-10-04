import { autorun } from "mobx"
import { FreNode } from "../../ast/index.js";
import { FreUtils } from "../../util/index.js";
import { BehaviorExecutionResult, FreCaret, FreKey } from "../util/index.js";
import { BoxFactory, FreEditor } from "../internal.js";
import { Box, ChoiceTextHelper, SelectOption, TextBox } from "./internal.js";

export abstract class AbstractChoiceBox extends Box {
    kind: string = "AbstractChoiceBox";
    placeholder: string;
    caretPosition: number = -1;
    _textBox: TextBox;
    textHelper: ChoiceTextHelper;

    protected constructor(node: FreNode, role: string, placeHolder: string, initializer?: Partial<AbstractChoiceBox>) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.placeholder = placeHolder;
        this.textHelper = new ChoiceTextHelper();
        this._textBox = BoxFactory.text(
            node,
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
                placeHolder: placeHolder,
            },
        );
        this.textHelper.box = this._textBox;
    }

    get textBox(): TextBox {
        // TODO Does this need to be done every time the textbox is requested?
        //      Or could this move to the constructor?
        this._textBox.propertyName = this.propertyName;
        this._textBox.propertyIndex = this.propertyIndex;
        return this._textBox;
    }

    set hasError(val: boolean) {
        // this._hasError = val;
        this._textBox.hasError = val;
    }

    get errorMessages(): string[] {
        return this._textBox.errorMessages;
    }

    addErrorMessage(val: string | string[]) {
        // this._errorMessages.push(val);
        this._textBox.addErrorMessage(val);
    }

    resetErrorMessages() {
        this._errorMessages = [];
        this._textBox.resetErrorMessages();
    }

    _getSelectedOption(): SelectOption | null {
        return null;
    }

    set getSelectedOption( value: () => SelectOption | null) {
        this._getSelectedOption = value
        this.isDirty()
        autorun( () => {
            this._getSelectedOption()
            this.isDirty()
        })
    }
    get getSelectedOption(): () => SelectOption | null {
        return this._getSelectedOption
    }

    // protected setSelectedOptionExec(value: () => SelectOption | null): SelectOption | null {
    //     this._getSelectedOption = value
    //     this.isDirty()
    //     autorun( () => {
    //         this._getSelectedOption()
    //         this.isDirty()
    //     })
    // }

    // @ts-ignore
    // parameter is present to support subclasses
    getOptions(editor: FreEditor): SelectOption[] {
        return [];
    }

    // @ts-ignore
    // parameter is present to support subclasses
    executeOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        console.error("AbstractChoiceBox.executeOption");
        return BehaviorExecutionResult.NULL;
    }

    setCaret: (caret: FreCaret, editor: FreEditor) => void = (caret: FreCaret, editor: FreEditor) => {
        if (!!this.textBox) {
            this.textBox.setCaret(caret);
            // todo remove if and when editor.selectedCaretPosition can be removed
            editor.selectedCaretPosition = caret;
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

    isEditable(): boolean {
        return true;
    }
}
