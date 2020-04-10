import { observable } from "mobx";

import { PiElement } from "../../language/PiModel";
import { Box } from "./Box";

/**
 * Box to indent another box with parameter "indent".
 */
export class IndentBox extends Box {
    readonly kind = "IndentBox";

    @observable child: Box = null;
    @observable indent: number = 4;

    constructor(
        exp: PiElement,
        role: string,
        indent: number,
        child: Box

    ) {
        super(exp, role);
        this.indent = indent;
        this.child = child;
        child.parent = this;
    }

    /**
     * Get the first selectable leaf box in the tree with `this` as root.
     */
    get firstLeaf(): Box {
        return this.child.firstLeaf
    }

    get lastLeaf(): Box {
        return this.child.lastLeaf;
    }

    get firstEditableChild(): Box {
        return this.child.firstEditableChild;
    }

    get children(): ReadonlyArray<Box> {
        return [ this.child];
    }

}

export function isIndentBox(b: Box): b is IndentBox {
    return b instanceof IndentBox;
}
