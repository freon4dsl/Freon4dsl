import { BehaviorExecutionResult } from "../util";
import { FreEditor } from "../internal";
import { AbstractChoiceBox, SelectOption, Box } from "./internal";
import { FreNode } from "../../ast";

// TODO can we rename this one? It is confusing to distinguish between the selectedBox in the editor and SelectBox instances.
export class SelectBox extends AbstractChoiceBox {
    readonly kind = "SelectBox";
    // getOptions: () => SelectOption[];
    // getSelectedOption: () => SelectOption | null;
    // setSelectedOption: (option: SelectOption) => void;
    /**
     * If true,  the element will be deleted as soon as the text becomes
     * empty because of removing the last character in the text.
     */
    deleteWhenEmpty: boolean = false;

    private getAllOptions(editor: FreEditor): SelectOption[] {
        return [];
    }

    constructor(
        node: FreNode,
        role: string,
        placeHolder: string,
        getOptions: (editor: FreEditor) => SelectOption[],
        getSelectedOption: () => SelectOption | null,
        selectOption: (editor: FreEditor, option: SelectOption) => BehaviorExecutionResult,
        initializer?: Partial<SelectBox>
    ) {
        super(node, role, placeHolder, initializer);
        this.getAllOptions = getOptions;
        this.getSelectedOption = getSelectedOption;
        this.selectOption = selectOption;
    }

    getOptions(editor: FreEditor): SelectOption[] {
        let matchingOptions: SelectOption[];
        matchingOptions = this.getAllOptions(editor);
        // matching text does not work correct as you need to know the cursor position.
        // TODO filter in the component where the cursor position is known.
            // .filter(option => MatchUtil.partialMatch(this.textBox.getText(), option.label));
        return matchingOptions;
    }

    public deleteWhenEmpty1(): boolean {
        return this.deleteWhenEmpty;
    }
}

export function isSelectBox(b: Box): b is SelectBox {
    return b?.kind === "SelectBox"; // b instanceof SelectBox;
}
