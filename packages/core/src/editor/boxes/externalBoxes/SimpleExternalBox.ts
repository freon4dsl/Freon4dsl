import { AbstractExternalBox } from "./AbstractExternalBox.js";
import type { Box } from "../Box.js";
import type { FreNode } from "../../../ast/index.js";
import { FreUtils } from "../../../util/index.js";

/**
 * This class represents a simple addition to the box tree. The box is only coupled to the
 * model node in which projection it occurs. There are no other connections to the model.
 *
 * Note that it should not be used to set values of any property of the model node.
 */
export class SimpleExternalBox extends AbstractExternalBox {
    readonly kind: string = "SimpleExternalBox";

    constructor(externalComponentName: string, node: FreNode, role: string, initializer?: Partial<SimpleExternalBox>) {
        super(externalComponentName, node, role);
        FreUtils.initializeObject(this, initializer);
    }
}

export function isSimpleExternalBox(b: Box): b is SimpleExternalBox {
    return b?.kind === "SimpleExternalBox"; // b instanceof SimpleExternalBox;
}
