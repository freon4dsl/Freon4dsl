import { Box } from "./Box";
import { AbstractChoiceBox } from "./AbstractChoiceBox";
import { PiElement } from "../../language/PiModel";

export class AliasBox extends AbstractChoiceBox {
    readonly kind = "AliasBox";
    placeholder: string;

    constructor(exp: PiElement, role: string, placeHolder: string, initializer?: Partial<AliasBox>) {
        super(exp, role, placeHolder, initializer);
    }
}

export function isAliasBox(b: Box): b is AliasBox {
    return b instanceof AliasBox;
}
