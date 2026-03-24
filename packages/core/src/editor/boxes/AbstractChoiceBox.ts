import { autorun } from "mobx"
import type { FreNode } from "../../ast/index.js";
import { FreUtils } from "../../util/index.js";
import { BehaviorExecutionResult } from "../util/index.js";
import { type FreEditor } from "../internal.js";
import { Box } from "./internal.js";
import type { SelectOption } from "./internal.js";

export abstract class AbstractChoiceBox extends Box {
    kind: string = "AbstractChoiceBox";
    placeholder: string;
    _isFirstInLine: boolean;

    protected constructor(node: FreNode, role: string, placeHolder: string, initializer?: Partial<AbstractChoiceBox>) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this.placeholder = placeHolder;
    }

    // If true, then this box should carry all error messages on the line.
    set isFirstInLine(v: boolean) {
        this._isFirstInLine = v
    }
    get firstInLine(): boolean {
        return this._isFirstInLine
    }

    _getSelectedOption(): SelectOption | null {
        return null;
    }

    set getSelectedOption( value: () => SelectOption | null) {
        this._getSelectedOption = value
        // this.isDirty()
        autorun( () => {
            this._getSelectedOption()
            this.isDirty()
        })
    }
    get getSelectedOption(): () => SelectOption | null {
        return this._getSelectedOption
    }

    getText(): string {
        if (this.getSelectedOption() === null) {
            return ""
        } else {
            return this.getSelectedOption().label
        }
    }

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

    /** @internal
     * This function is called after the text changes in the browser.
     * It ensures that the SelectableComponent will calculate the new coordinates.
     */
    update: () => void = () => {
        /* To be overwritten by `ActionComponent` */
    };

    isEditable(): boolean {
        return true;
    }
}
