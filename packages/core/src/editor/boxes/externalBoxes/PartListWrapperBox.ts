import { Box } from "../Box.js";
import type { FreNode } from "../../../ast/index.js";
import { FreUtils } from "../../../util/index.js";
import { AbstractPropertyWrapperBox } from "./AbstractPropertyWrapperBox.js";

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
