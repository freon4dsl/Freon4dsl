import { Box } from "../Box";
import { FreNode } from "../../../ast";
import { FreUtils } from "../../../util";
import { AbstractPropertyWrapperBox } from "./AbstractPropertyWrapperBox";

/**
 * This class represents an external component that replaces the native projection of a list of model properties, like "notes: NoteConcept[]".
 */
export class PartWrapperBox extends AbstractPropertyWrapperBox {
    readonly kind: string = "PartWrapperBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        childBox: Box,
        initializer?: Partial<PartWrapperBox>,
    ) {
        super(externalComponentName, node, role, propertyName, childBox);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): FreNode {
        return this.node[this.propertyName];
    }
}

export function isPartWrapperBox(b: Box): b is PartWrapperBox {
    return b?.kind === "PartWrapperBox"; // b instanceof PartWrapperBox;
}
