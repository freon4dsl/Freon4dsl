import { Box } from "./Box";
import { FreNode } from "../../ast";

export class EmptyLineBox extends Box {
    kind: string = "EmptyLineBox";

    constructor(element: FreNode, role: string, cssClass?: string ) {
        super(element, role);
        this.selectable = false;
        this.cssClass = cssClass;
    }
}

export function isEmptyLineBox(b: Box): b is EmptyLineBox {
    return b?.kind === "EmptyLineBox"; // b instanceof EmptyLineBox;
}
