import { FreUtils } from "../../util/index.js";
import { Box } from "./Box";
import { FreNode } from "../../ast";

export class EmptyLineBox extends Box {
    kind: string = "EmptyLineBox";

    constructor(element: FreNode, role: string, initializer?: Partial<EmptyLineBox>) {
        super(element, role);
        FreUtils.initializeObject(this, initializer);
        this.selectable = false;
    }
}

export function isEmptyLineBox(b: Box): b is EmptyLineBox {
    return b?.kind === "EmptyLineBox"; // b instanceof EmptyLineBox;
}
