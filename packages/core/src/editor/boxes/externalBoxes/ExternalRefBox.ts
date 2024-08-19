import { Box } from "../Box";
import { FreNode, FreNodeReference } from "../../../ast";
import { FreUtils } from "../../../util";
import { AbstractExternalPropertyBox } from "./AbstractExternalPropertyBox";

/**
 * This class represents an external component that replaces the native projection of a single reference to a model property, like "reference note: NoteConcept".
 */
export class ExternalRefBox extends AbstractExternalPropertyBox {
    readonly kind: string = "ExternalRefBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        initializer?: Partial<ExternalRefBox>,
    ) {
        super(externalComponentName, node, role, propertyName);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): FreNodeReference<any> {
        const val = this.node[this.propertyName];
        if (typeof val === this.getPropertyType()) {
            // todo check
            return val;
        }
        return undefined;
    }

    setPropertyValue(newValue: FreNodeReference<any>) {
        // todo add checks
        this.node[this.propertyName] = newValue;
    }
}

export function isExternalRefBox(b: Box): b is ExternalRefBox {
    return b?.kind === "ExternalRefBox"; // b instanceof ExternalRefBox;
}
