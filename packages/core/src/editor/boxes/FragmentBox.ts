import { Box } from "./Box";
import { FreNode } from "../../ast";
import { FreUtils } from "../../util";

export class FragmentBox extends Box {
    readonly kind: string = "FragmentBox";
    private _childBox: Box;

    constructor(node: FreNode, role: string, childBox: Box, initializer?: Partial<FragmentBox>) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        this._childBox = childBox;
    }

    get childBox(): Box {
        return this._childBox;
    }
}

export function isFragmentBox(box: Box): box is FragmentBox {
    return box?.kind === "FragmentBox"; //  box instanceof FragmentBox;
}
