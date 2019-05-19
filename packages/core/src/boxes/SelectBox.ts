import { AbstractChoiceBox } from "./AbstractChoiceBox";
import { SelectOption } from "./SelectOption";
import { PiElement } from "../language/PiModel";
import { Box } from "./Box";

export class SelectBox extends AbstractChoiceBox {
    readonly kind = "SelectBox";
    getOptions: () => SelectOption[];
    getSelectedOption: () => SelectOption | null;
    setSelectedOption: (option: SelectOption) => void;
    /**
     * If true,  the element will be deleted as soon as the text becomes
     * empty because of removing the last character in the text.
     */
    deleteWhenEmpty: boolean = false;

    constructor(
        exp: PiElement,
        role: string,
        placeHolder: string,
        getOptions: () => SelectOption[],
        getSelectedOption: () => SelectOption | null,
        setSelectedOption: (option: SelectOption) => void,
        initializer?: Partial<SelectBox>
    ) {
        super(exp, role, placeHolder, initializer);
        this.getOptions = getOptions;
        this.getSelectedOption = getSelectedOption;
        this.setSelectedOption = setSelectedOption;
    }

    public deleteWhenEmpty1(): boolean {
        return this.deleteWhenEmpty;
    }
}

export function isSelectBox(b: Box): b is SelectBox {
    return b instanceof SelectBox;
}
