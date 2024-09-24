import { BehaviorExecutionResult } from "../util";
import { FreEditor } from "../internal";
import { AbstractChoiceBox, SelectOption, Box } from "./internal";
import { FreNode } from "../../ast";

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
    selectOption(editor: FreEditor, option: SelectOption): BehaviorExecutionResult {
        const result = this._innerSelectOption(editor, option);
        // todo add if-stat when generation is changed to create a function that returns a result
        // if (result === BehaviorExecutionResult.EXECUTED) {
        // TODO Might need an index as well
        this.isDirty()
        const nodeBox = editor.findBoxForNode(this.node, this.propertyName)?.nextLeafRight
        editor.selectElementForBox(nodeBox)
        console.log(`SelectBox: selectOption: ${option.label} box.kind: ${nodeBox.role}`)
        // }
        return result
    }
}

export function isSelectBox(b: Box): b is SelectBox {
    return b instanceof SelectBox; // include inherit box types
}
