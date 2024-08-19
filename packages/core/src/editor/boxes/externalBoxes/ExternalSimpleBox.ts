import { AbstractExternalBox } from "./AbstractExternalBox";
import { Box } from "../Box";
import { FreNode } from "../../../ast";
import { FreUtils } from "../../../util";

/**
 * This class represents a simple addition to the box tree. The box is only coupled to the
 * model node in which projection it occurs. There are no other connections to the model.
 *
 * Note that it should not be used to set values of any property of the model node.
 */
export class ExternalSimpleBox extends AbstractExternalBox {
    readonly kind: string = "ExternalSimpleBox";

    constructor(externalComponentName: string, node: FreNode, role: string, initializer?: Partial<ExternalSimpleBox>) {
        super(externalComponentName, node, role);
        FreUtils.initializeObject(this, initializer);
    }
}

export function isExternalSimpleBox(b: Box): b is ExternalSimpleBox {
    return b?.kind === "ExternalSimpleBox"; // b instanceof ExternalSimpleBox;
}
