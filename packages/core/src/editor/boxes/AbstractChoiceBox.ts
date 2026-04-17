import { autorun } from "mobx"
import type { FreNode } from "../../ast/index.js";
import { FreUtils, jsonAsString } from "../../util/index.js"
import { BehaviorExecutionResult } from "../util/index.js"
import { type FreEditor } from "../internal.js";
import { Box } from "./internal.js";
import type { SelectOption } from "./internal.js";
import { FreLogger } from "../../logging/index.js"

const LOGGER: FreLogger = new FreLogger("AbstractChoiceBox").mute()

export abstract class AbstractChoiceBox extends Box {
    kind: string = "AbstractChoiceBox"
    placeholder: string
    _isFirstInLine: boolean

    protected constructor(node: FreNode, role: string, placeHolder: string, initializer?: Partial<AbstractChoiceBox>) {
        super(node, role)
        FreUtils.initializeObject(this, initializer)
        this.placeholder = placeHolder
    }

    // If true, then this box should carry all error messages on the line.
    set isFirstInLine(v: boolean) {
        this._isFirstInLine = v
    }
    get firstInLine(): boolean {
        return this._isFirstInLine
    }

    _getSelectedOption(): SelectOption | null {
        return null
    }

    set getSelectedOption(value: () => SelectOption | null) {
        this._getSelectedOption = value
        // this.isDirty()
        autorun(() => {
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
        return []
    }

    // @ts-ignore
    // parameter is present to support subclasses
    executeOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        LOGGER.error("AbstractChoiceBox.executeOption")
        return BehaviorExecutionResult.NULL
    }

    /** @internal
     * This function is called after the text changes in the browser.
     * It ensures that the SelectableComponent will calculate the new coordinates.
     */
    update: () => void = () => {
        /* To be overwritten by `ActionComponent` */
    }

    isEditable(): boolean {
        return true
    }

    makeOptionsUnique(options: SelectOption[]): SelectOption[] {
        LOGGER.log(`makeOptionsUnique options: ${options.map((o) => o.label)}`)
        // Remove doubles, to avoid errors. Check on the id, because identical labels are allowed!
        const seen: string[] = []
        const result: SelectOption[] = []
        options.forEach((option) => {
            if (seen.includes(option.id)) {
                LOGGER.log(`makeOptionsUnique.Option box(${this.id})` + jsonAsString(option) + " is a duplicate")
            } else {
                seen.push(option.id)
                result.push(option)
            }
        })
        return result
    }

    /***********************************************************************************
     * Functions for the paste/copy/cut actions from the webapp
     ***********************************************************************************/
    insertAtSelection: (insert: string) => void = (_insert: string) => {
        // Default implementation, to be overridden by TextDropdownComponent
        LOGGER.log("AbstractChoiceBox insertAtSelection")
    }

    getSelectedText: () => string = () => {
        // Default implementation, to be overridden by TextDropdownComponent
        LOGGER.log("AbstractChoiceBox getSelectedText")
        return this.getText()
    }

    deleteSelection: () => void = () => {
        // Default implementation, to be overridden by TextDropdownComponent
        LOGGER.log("AbstractChoiceBox deleteSelection")
    }
}
