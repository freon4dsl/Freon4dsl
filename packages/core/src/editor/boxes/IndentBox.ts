import { FreNode } from "../../ast";
import { Box } from "./Box";

/**
 * Box to indent another box with parameter "indent".
 */
export class IndentBox extends Box {
    readonly kind = "IndentBox";

    private $child: Box = null;

    get child() {
        return this.$child;
    }

    set child(v: Box) {
        this.$child = v;
        this.$child.parent = this;
        this.isDirty();
    }

    indent: number = 4;
    fullWidth: boolean = false;

    constructor(node: FreNode, role: string, indent: number, fullWidth: boolean = false,  child: Box, cssClass?: string ) {
        super(node, role);
        this.indent = indent;
        this.fullWidth = fullWidth;
        this.child = child;
        this.selectable = false;
        this.cssClass = cssClass;
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

export function isIndentBox(b: Box): b is IndentBox {
    return b?.kind === "IndentBox"; // " b instanceof IndentBox;
}
