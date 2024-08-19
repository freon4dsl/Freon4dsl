import { Box } from "../Box";
import { FreNode } from "../../../ast";
import { FreUtils } from "../../../util";
import { AbstractExternalPropertyBox } from "./AbstractExternalPropertyBox";
import { runInAction } from "mobx";

/**
 * This class represent an external box replacing the native projection of a single property of primitive type.
 */
export class ExternalStringBox extends AbstractExternalPropertyBox {
    readonly kind: string = "ExternalStringBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        initializer?: Partial<ExternalStringBox>,
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
            runInAction(() => {
                this.node[this.propertyName] = newValue;
            });
        } else {
            console.log(
                "ExternalStringBox.setPropertyValue type error: trying to set property of type " +
                    this.getPropertyType() +
                    " to a value of type " +
                    typeof newValue,
            );
        }
    }
}

export function isExternalStringBox(b: Box): b is ExternalStringBox {
    return b?.kind === "ExternalStringBox"; // b instanceof ExternalStringBox;
}
