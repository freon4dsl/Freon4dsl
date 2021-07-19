import { BehaviorExecutionResult } from "../../util";
import { PiEditor } from "../internal";
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
        this.getOptions= getOptions;
        this.getSelectedOption = getSelectedOption;
        this.selectOption = selectOption;
    }

    public deleteWhenEmpty1(): boolean {
        return this.deleteWhenEmpty;
    }
}

export function isSelectBox(b: Box): b is SelectBox {
    return b.kind === "SelectBox"; // b instanceof SelectBox;
}
