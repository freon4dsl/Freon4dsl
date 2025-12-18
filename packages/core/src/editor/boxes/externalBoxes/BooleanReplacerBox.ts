import { AST } from "../../../change-manager/index.js";
import type { Box } from "../Box.js";
import type { FreNode } from "../../../ast/index.js";
import { FreUtils } from "../../../util/index.js";
import { AbstractExternalPropertyBox } from "./AbstractExternalPropertyBox.js";

/**
 * This class represent an external box replacing the native projection of a single property of primitive type.
 */
export class BooleanReplacerBox extends AbstractExternalPropertyBox {
    readonly kind: string = "BooleanReplacerBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        initializer?: Partial<BooleanReplacerBox>,
    ) {
        super(externalComponentName, node, role, propertyName);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): boolean | undefined {
        const val: boolean | undefined = this.node[this.propertyName];
        if (typeof val === "boolean") {
            return val;
        }
        return undefined;
    }

    setPropertyValue(newValue: boolean) {
        if (typeof newValue === "boolean" && this.getPropertyType() === "boolean") {
            AST.change(() => {
                this.node[this.propertyName] = newValue;
            });
        } else {
            console.log(
                "BooleanReplacerBox.setPropertyValue type error: trying to set property of type " +
                    this.getPropertyType() +
                    " to a value of type " +
                    typeof newValue,
            );
        }
    }
}

export function isBooleanReplacerBox(b: Box): b is BooleanReplacerBox {
    return b?.kind === "BooleanReplacerBox"; // b instanceof BooleanReplacerBox;
}
