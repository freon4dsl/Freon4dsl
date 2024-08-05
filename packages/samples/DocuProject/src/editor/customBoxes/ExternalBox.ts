import {Box, FreNode, FreUtils} from "@freon4dsl/core";

export class ExternalBox extends Box {
    readonly kind: string = "FbPopover";
    protected _children: Box[] = [];

    constructor(node: FreNode, role: string, children?: Box[], initializer?: Partial<ExternalBox>) {
        super(node, role);
        FreUtils.initializeObject(this, initializer);
        if (!!children) {
            children.forEach(b => this.addChildNoDirty(b));
        }
    }

    /**
     * To be used when adding multiple children in one go, avoiding spurious isDirty() calls.
     * @param child
     * @private
     */
    private addChildNoDirty(child: Box | null) {
        if (!!child) {
            this._children.push(child);
            child.parent = this;
        }
    }

    get children(): ReadonlyArray<Box> {
        return this._children as ReadonlyArray<Box>;
    }

    // todo do we need more of the replace children functionality like in LayoutComponent??
}
