import { Box } from "../Box.js";
import type { FreNode } from "../../../ast/index.js";
import { FreUtils } from "../../../util/index.js";
import { AbstractExternalPropertyBox } from "./AbstractExternalPropertyBox.js";

/**
 * This class represents an external component that replaces the native projection of a list of model properties, like "notes: NoteConcept[]".
 */
export class PartListReplacerBox extends AbstractExternalPropertyBox {
    readonly kind: string = "PartListReplacerBox";
    private _children: Box[] = [];

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        children: Box[],
        initializer?: Partial<PartListReplacerBox>,
    ) {
        super(externalComponentName, node, role, propertyName);
        FreUtils.initializeObject(this, initializer);
        children.forEach((b) => this.addChildNoDirty(b));
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

    replaceChildren(children: Box[]): PartListReplacerBox {
        this._children.forEach((ch) => { if(ch.parent === this) ch.parent = null });
        // this._children.forEach((ch) => ch.parent = null);
        this._children.splice(0, this._children.length);
        if (!!children) {
            children.forEach((child) => {
                if (!!child) {
                    this._children.push(child);
                    child.parent = this;
                }
            });
        }
        this.isDirty();
        return this;
    }


    get children(): ReadonlyArray<Box> {
        return this._children as ReadonlyArray<Box>;
    }

    getPropertyValue(): FreNode[] {
        return this.node[this.propertyName];
    }

    // There is no need for a setPropertyValue, because every list property is initialized as an empty list.
    // Any changes must be done by adding removing to that list.
}

export function isPartListReplacerBox(b: Box): b is PartListReplacerBox {
    return b?.kind === "PartListReplacerBox"; // b instanceof PartListReplacerBox;
}
