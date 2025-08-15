import { Box } from "../Box.js";
import type { FreNode } from "../../../ast/index.js";
import { FreUtils, notNullOrUndefined } from '../../../util/index.js';
import { AbstractExternalPropertyBox } from "./AbstractExternalPropertyBox.js";

/**
 * This class represents an external component that replaces the native projection of a single model property, like "note: NoteConcept".
 */
export class PartReplacerBox extends AbstractExternalPropertyBox {
    readonly kind: string = "PartReplacerBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        initializer?: Partial<PartReplacerBox>,
    ) {
        super(externalComponentName, node, role, propertyName);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): FreNode {
        const val: FreNode = this.node[this.propertyName];
        if (notNullOrUndefined(val) && val.freLanguageConcept() === this.getPropertyType()) {
            return val;
        }
        return undefined;
    }

    setPropertyValue(newValue: FreNode) {
        this.node[this.propertyName] = newValue;
    }
}

export function isPartReplacerBox(b: Box): b is PartReplacerBox {
    return b?.kind === "PartReplacerBox"; // b instanceof PartReplacerBox;
}
