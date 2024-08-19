import { Box } from "../Box";
import { FreNode } from "../../../ast";
import { FreUtils } from "../../../util";
import { AbstractExternalPropertyBox } from "./AbstractExternalPropertyBox";

/**
 * This class represents an external component that replaces the native projection of a single model property, like "note: NoteConcept".
 */
export class ExternalPartBox extends AbstractExternalPropertyBox {
    readonly kind: string = "ExternalPartBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        initializer?: Partial<ExternalPartBox>,
    ) {
        super(externalComponentName, node, role, propertyName);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): FreNode {
        const val = this.node[this.propertyName];
        if (typeof val === this.getPropertyType()) {
            return val;
        }
        return undefined;
    }

    setPropertyValue(newValue: FreNode) {
        newValue;
    }
}

export function isExternalPartBox(b: Box): b is ExternalPartBox {
    return b?.kind === "ExternalPartBox"; // b instanceof ExternalPartBox;
}
