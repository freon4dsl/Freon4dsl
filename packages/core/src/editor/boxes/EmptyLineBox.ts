import { Box } from "./Box";
import { PiElement } from "../../ast";


export class EmptyLineBox extends Box {
    kind = "EmptyLineBox";

    constructor(element: PiElement, role: string) {
        super(element, role);
        this.selectable = false;
    }
}

export function isEmptyLineBox(b: Box): b is EmptyLineBox {
    return b?.kind === "EmptyLineBox"; // b instanceof EmptyLineBox;
}
