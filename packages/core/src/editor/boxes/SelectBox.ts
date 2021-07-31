import { BehaviorExecutionResult, MatchUtil } from "../../util";
import { PiEditor, triggerToString } from "../internal";
import { AbstractChoiceBox, SelectOption, Box } from "./internal";
import { PiElement } from "../../language";

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

    private getAllOptions(editor: PiEditor): SelectOption[] {
        return [];
    };


    constructor(
        exp: PiElement,
        role: string,
        placeHolder: string,
        getOptions: (editor: PiEditor) => SelectOption[],
        getSelectedOption: () => SelectOption | null,
        selectOption: (editor: PiEditor, option: SelectOption) => Promise<BehaviorExecutionResult>,
        initializer?: Partial<SelectBox>
    ) {
        super(exp, role, placeHolder, initializer);
        this.getAllOptions = getOptions;
        this.getSelectedOption = getSelectedOption;
        this.selectOption = selectOption;
    }

    getOptions(editor: PiEditor):  SelectOption[]  {
        const matchingOptions: SelectOption[] = this.getAllOptions(editor)
            .filter(option => MatchUtil.partialMatch(this.textBox.getText(), option.label));
        // if (matchingOptions.length === 0) {
        //     return BehaviorExecutionResult.NO_MATCH;
        // }else {
        //     return BehaviorExecutionResult.PARTIAL_MATCH;
        // }
        return matchingOptions
    }

    public deleteWhenEmpty1(): boolean {
        return this.deleteWhenEmpty;
    }
}

export function isSelectBox(b: Box): b is SelectBox {
    return b.kind === "SelectBox"; // b instanceof SelectBox;
}
