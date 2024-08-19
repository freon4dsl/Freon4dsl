import { Box } from "../Box";
import { FreNode } from "../../../ast";
import { FreUtils } from "../../../util";
import { AbstractExternalPropertyBox } from "./AbstractExternalPropertyBox";
import { runInAction } from "mobx";

/**
 * This class represent an external box replacing the native projection of a single property of primitive type.
 */
export class ExternalBooleanBox extends AbstractExternalPropertyBox {
    readonly kind: string = "ExternalBooleanBox";

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        propertyName: string,
        initializer?: Partial<ExternalBooleanBox>,
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
            runInAction(() => {
                this.node[this.propertyName] = newValue;
            });
        } else {
            console.log(
                "ExternalBooleanBox.setPropertyValue type error: trying to set property of type " +
                    this.getPropertyType() +
                    " to a value of type " +
                    typeof newValue,
            );
        }
    }
}

export function isExternalBooleanBox(b: Box): b is ExternalBooleanBox {
    return b?.kind === "ExternalBooleanBox"; // b instanceof ExternalBooleanBox;
}
