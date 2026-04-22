import { BehaviorExecutionResult } from "../util/index.js";
import { type FreEditor } from "../internal.js";
import { AbstractChoiceBox, type Box } from "./internal.js";
import type { SelectOption } from "./internal.js";
import type { FreNode } from "../../ast/index.js";

// TODO can we rename this one? It is confusing to distinguish between the selectedBox in the editor and SelectBox instances.
export class SelectBox extends AbstractChoiceBox {
    readonly kind: string = "SelectBox";
    /**
     * If true,  the element will be deleted as soon as the text becomes
     * empty because of removing the last character in the text.
     */
    deleteWhenEmpty: boolean = false;

    private getAllOptions: (editor: FreEditor) => SelectOption[];
     _innerSelectOption: (editor: FreEditor, option: SelectOption) => BehaviorExecutionResult;

    constructor(
        node: FreNode,
        role: string,
        placeHolder: string,
        getOptions: (editor: FreEditor) => SelectOption[],
        getSelectedOption: () => SelectOption | null,
        selectOption: (editor: FreEditor, option: SelectOption) => BehaviorExecutionResult,
        initializer?: Partial<SelectBox>,
    ) {
        super(node, role, placeHolder, initializer);
        this.getAllOptions = getOptions;
        this.getSelectedOption = getSelectedOption;
        this._innerSelectOption = selectOption;
    }
    
    getOptions(editor: FreEditor): SelectOption[] {
        // console.log("Options for " + this.node.freLanguageConcept() + this.getAllOptions(editor).map(opt => {
        //     opt.label
        // }))
        return this.makeOptionsUnique(this.getAllOptions(editor));
    }

    executeOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        // console.log(`SelectBox: executeOption: ${option.label}`)
        const result: BehaviorExecutionResult = this._innerSelectOption(editor, option);
        // todo When this select box is an expression operator, the innerSelectOption already sets a new editor selection.
        //  The following code should in that case not be executed
        if (result === BehaviorExecutionResult.EXECUTED) {
            // console.log("innerSelectOption IS executed")
            this.isDirty()
            // TODO Might need an index as well
            const nodeBox: Box = editor.findBoxForNode(this.node, this.propertyName)?.nextLeafRight
            // console.log(`SelectBox: executeOption: ${option.label} box.kind: ${nodeBox.role}`)
            editor.selectElementForBox(nodeBox)
        // } else {
        //     console.log("innerSelectOption NOT executed")
        }
        return result
    }
}

export function isSelectBox(b: Box): b is SelectBox {
    return b instanceof SelectBox; // include inherit box types
}
