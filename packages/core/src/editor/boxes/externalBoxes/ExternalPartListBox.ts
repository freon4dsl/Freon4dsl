import { Box } from "../Box.js";
import { FreNode } from "../../../ast/index.js";
import { FreUtils } from "../../../util/index.js";
import { AbstractExternalPropertyBox } from "./AbstractExternalPropertyBox.js";

/**
 * This class represents an external component that replaces the native projection of a list of model properties, like "notes: NoteConcept[]".
 */
export class ExternalPartListBox extends AbstractExternalPropertyBox {
    readonly kind: string = "ExternalPartListBox";
    private _children: Box[] = [];

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        children: Box[],
        initializer?: Partial<ExternalPartListBox>,
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

    replaceChildren(children: Box[]): ExternalPartListBox {
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
}

export function isExternalPartListBox(b: Box): b is ExternalPartListBox {
    return b?.kind === "ExternalPartListBox"; // b instanceof ExternalPartListBox;
}
