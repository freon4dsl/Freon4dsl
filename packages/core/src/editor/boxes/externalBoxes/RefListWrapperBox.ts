import { Box } from "../Box";
import { FreNode, FreNodeReference } from "../../../ast";
import { FreUtils } from "../../../util";
import { AbstractPropertyWrapperBox } from "./AbstractPropertyWrapperBox";

/**
 * This class represents an external component that replaces the native projection of a list of model properties, like "notes: NoteConcept[]".
 */
export class RefListWrapperBox extends AbstractPropertyWrapperBox {
    readonly kind: string = "RefListWrapperBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        childBox: Box,
        initializer?: Partial<RefListWrapperBox>,
    ) {
        super(externalComponentName, node, role, propertyName, childBox);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): FreNodeReference<any>[] {
        const val = this.node[this.propertyName];
        // if (typeof val === this.propertyClassifierName) {
        return val;
        // }
        // return undefined;
    }
}

export function isRefListWrapperBox(b: Box): b is RefListWrapperBox {
    return b?.kind === "RefListWrapperBox"; // b instanceof RefListWrapperBox;
}
