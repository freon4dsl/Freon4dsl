import {Box} from "../Box";
import {FreNode, FreNodeReference} from "../../../ast";
import {FreUtils} from "../../../util";
import {AbstractExternalPropertyBox} from "./AbstractExternalPropertyBox";

/**
 * This class represents an external component that replaces the native projection of a list of references, like "reference notes: NoteConcept[]".
 */
export class ExternalRefListBox extends AbstractExternalPropertyBox {
    readonly kind: string = "ExternalRefListBox";
    private _children: Box[] = [];

    constructor(externalComponentName: string, node: FreNode, role: string, propertyName: string, children: Box[], initializer?: Partial<ExternalRefListBox>) {
        super(externalComponentName, node, role, propertyName);
        FreUtils.initializeObject(this, initializer);
        children.forEach(b => this.addChildNoDirty(b));
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
            // child.isVisible = false;
        }
    }

    getChildren(): ReadonlyArray<Box> {
        return this._children as ReadonlyArray<Box>;
    }

    getPropertyName(): string {
        return this.propertyName;
    }

    getPropertyValue(): FreNodeReference<any>[] {
        const val = this.node[this.propertyName];
        // if (typeof val === this.propertyClassifierName) {
            return val;
        // }
        // return undefined;
    }

    setPropertyValue(newValue: FreNodeReference<any>[]) {
        // todo add checks
        this.node[this.propertyName] = newValue;
    }

    // todo do we need more of the replace children functionality like in LayoutComponent??
}

export function isExternalRefListBox(b: Box): b is ExternalRefListBox {
    return b?.kind === "ExternalRefListBox"; // b instanceof ExternalRefListBox;
}
