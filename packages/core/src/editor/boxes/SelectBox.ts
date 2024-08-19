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
        this.selectOption = selectOption;
    }

    getOptions(editor: FreEditor): SelectOption[] {
        // console.log("Options for " + this.element.freLanguageConcept() + this.getAllOptions(editor).map(opt => {
        //     opt.label
        // }))
        return this.getAllOptions(editor);
    }

    public deleteWhenEmpty1(): boolean {
        return this.deleteWhenEmpty;
    }
}

export function isSelectBox(b: Box): b is SelectBox {
    return b?.kind === "SelectBox"; // b instanceof SelectBox;
}
