import { Box } from "../Box.js";
import type { FreNode, FreNodeReference } from "../../../ast/index.js";
import { FreUtils, notNullOrUndefined } from '../../../util/index.js';
import { AbstractExternalPropertyBox } from "./AbstractExternalPropertyBox.js";

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
        const val: FreNodeReference<any> = this.node[this.propertyName];
        // console.log('getPropertyValue', this.node.freLanguageConcept(), this.propertyName, this.getPropertyType(), typeof val);
        if (notNullOrUndefined(val) && val.typeName === this.getPropertyType()) {
            // console.log('getPropertyValue returining', val);
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
