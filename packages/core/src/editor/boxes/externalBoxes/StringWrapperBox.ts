import { Box } from "../Box";
import { FreNode } from "../../../ast";
import { FreUtils } from "../../../util";
import { AbstractPropertyWrapperBox } from "./AbstractPropertyWrapperBox";

/**
 * This class represent an external box wrapping a single property of primitive type.
 */
export class StringWrapperBox extends AbstractPropertyWrapperBox {
    readonly kind: string = "StringWrapperBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        childBox: Box,
        initializer?: Partial<StringWrapperBox>,
    ) {
        super(externalComponentName, node, role, propertyName, childBox);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): string | undefined {
        const val: string | undefined = this.node[this.propertyName];
        if (typeof val === "string") {
            return val;
        }
        return undefined;
    }
}

export function isStringWrapperBox(b: Box): b is StringWrapperBox {
    return b?.kind === "StringWrapperBox"; // b instanceof StringWrapperBox;
}
