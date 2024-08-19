import { Box } from "../Box";
import { FreNode } from "../../../ast";
import { FreUtils } from "../../../util";
import { AbstractPropertyWrapperBox } from "./AbstractPropertyWrapperBox";

/**
 * This class represent an external box wrapping a single property of primitive type.
 */
export class BooleanWrapperBox extends AbstractPropertyWrapperBox {
    readonly kind: string = "BooleanWrapperBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        childBox: Box,
        initializer?: Partial<BooleanWrapperBox>,
    ) {
        super(externalComponentName, node, role, propertyName, childBox);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): boolean | undefined {
        const val: boolean | undefined = this.node[this.propertyName];
        if (typeof val === "boolean") {
            return val;
        }
        return undefined;
    }
}

export function isBooleanWrapperBox(b: Box): b is BooleanWrapperBox {
    return b?.kind === "BooleanWrapperBox"; // b instanceof BooleanWrapperBox;
}
