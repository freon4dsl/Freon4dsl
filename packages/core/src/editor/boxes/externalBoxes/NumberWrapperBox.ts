import { Box } from "../Box";
import { FreNode } from "../../../ast";
import { FreUtils } from "../../../util";
import { AbstractPropertyWrapperBox } from "./AbstractPropertyWrapperBox";

/**
 * This class represent an external box wrapping a single property of primitive type.
 */
export class NumberWrapperBox extends AbstractPropertyWrapperBox {
    readonly kind: string = "NumberWrapperBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        childBox: Box,
        initializer?: Partial<NumberWrapperBox>,
    ) {
        super(externalComponentName, node, role, propertyName, childBox);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): number | undefined {
        const val: number | undefined = this.node[this.propertyName];
        if (typeof val === "number") {
            return val;
        }
        return undefined;
    }
}

export function isNumberWrapperBox(b: Box): b is NumberWrapperBox {
    return b?.kind === "NumberWrapperBox"; // b instanceof NumberWrapperBox;
}
