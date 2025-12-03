import { AST } from "../../../change-manager/index.js";
import { Box } from "../Box.js";
import type { FreNode } from "../../../ast/index.js";
import { FreUtils } from "../../../util/index.js";
import { AbstractExternalPropertyBox } from "./AbstractExternalPropertyBox.js";

/**
 * This class represent an external box replacing the native projection of a single property of primitive type.
 */
export class StringReplacerBox extends AbstractExternalPropertyBox {
    readonly kind: string = "StringReplacerBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        initializer?: Partial<StringReplacerBox>,
    ) {
        super(externalComponentName, node, role, propertyName);
        FreUtils.initializeObject(this, initializer);
    }

    getPropertyValue(): string | undefined {
        const val: string | undefined = this.node[this.propertyName];
        if (typeof val === "string") {
            return val;
        }
        return undefined;
    }

    setPropertyValue(newValue: string | boolean | number) {
        if (typeof newValue === "string" && this.getPropertyType() === "string") {
            AST.change(() => {
                this.node[this.propertyName] = newValue;
            });
        } else {
            console.log(
                "StringReplacerBox.setPropertyValue type error: trying to set property of type " +
                    this.getPropertyType() +
                    " to a value of type " +
                    typeof newValue,
            );
        }
    }
}

export function isStringReplacerBox(b: Box): b is StringReplacerBox {
    return b?.kind === "StringReplacerBox"; // b instanceof StringReplacerBox;
}
