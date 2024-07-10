import { FreNode } from "../../ast";
import { Box } from "./Box";

/**
 * Box to indent another box with parameter "indent".
 */
export class ExpandableBox extends Box {
    readonly kind = "ExpandableBox";

    private $child: Box = null;

    get child() {
        return this.$child;
    }

    set child(v: Box) {
        this.$child = v;
        this.$child.parent = this;
        this.isDirty();
    }

    constructor(node: FreNode, role: string, child: Box) {
        super(node, role);
        this.child = child;
        this.selectable = false;
    }

    /**
     * Get the first selectable leaf box in the tree with `this` as root.
     */
    get firstLeaf(): Box {
        return this.child.firstLeaf;
    }

    get lastLeaf(): Box {
        return this.child.lastLeaf;
    }

    get firstEditableChild(): Box {
        return this.child.firstEditableChild;
    }

    get children(): ReadonlyArray<Box> {
        return [this.child];
    }
}

export function isExpandableBox(b: Box): b is ExpandableBox {
    return b?.kind === "ExpandableBox"; // " b instanceof ExpandableBox;
}