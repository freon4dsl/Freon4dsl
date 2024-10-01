import { BehaviorExecutionResult } from "../util/index.js";
import { FreEditor } from "../internal.js";
import { AbstractChoiceBox, SelectOption, Box } from "./internal.js";
import { FreNode } from "../../ast/index.js";

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
        // console.log("Options for " + this.element.freLanguageConcept() + this.getAllOptions(editor).map(opt => {
        //     opt.label
        // }))
        return this.getAllOptions(editor);
    }

    executeOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        const result: BehaviorExecutionResult = this._innerSelectOption(editor, option);
        if (result === BehaviorExecutionResult.EXECUTED) {
            this.isDirty()
            // TODO Might need an index as well
            const nodeBox: Box = editor.findBoxForNode(this.node, this.propertyName)?.nextLeafRight
            editor.selectElementForBox(nodeBox)
            // console.log(`SelectBox: executeOption: ${option.label} box.kind: ${nodeBox.role}`)
        }
        return result
    }
}

export function isSelectBox(b: Box): b is SelectBox {
    return b instanceof SelectBox; // include inherit box types
}
