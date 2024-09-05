import { Box } from "../Box";
import { FreNode } from "../../../ast";
import { FreUtils } from "../../../util";
import { AbstractPropertyWrapperBox } from "./AbstractPropertyWrapperBox";

/**
 * This class represents an external component that replaces the native projection of a list of model properties, like "notes: NoteConcept[]".
 */
export class PartListWrapperBox extends AbstractPropertyWrapperBox {
    readonly kind: string = "PartListWrapperBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        childBox: Box,
        initializer?: Partial<PartListWrapperBox>,
    ) {
        super(externalComponentName, node, role, propertyName, childBox);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): FreNode[] {
        return this.node[this.propertyName];
    }
}

export function isPartListWrapperBox(b: Box): b is PartListWrapperBox {
    return b?.kind === "PartListWrapperBox"; // b instanceof PartListWrapperBox;
}
