import { Box } from "../Box";
import { FreNode } from "../../../ast";

/**
 * This type represents any parameter that may be passed from the .edit file
 * to the external component that is used to show this box.
 */
export type ExternalParameter = {
    key: string;
    value: string;
};

/**
 * All external boxes inherit from this box. It holds information on the external
 * component to use, and any parameters that should be passed to the external component.
 */
export abstract class AbstractExternalBox extends Box {
    readonly kind: string = "ExternalBox";
    private readonly _externalComponentName: string = "unknownComponent";
    params: ExternalParameter[] = [];

    constructor(externalComponentName: string, node: FreNode, role: string) {
        super(node, role);
        this._externalComponentName = externalComponentName;
    }

    get externalComponentName(): string {
        return this._externalComponentName;
    }

    findParam(key: string): string | undefined {
        return this.params?.find((pair) => pair.key === key)?.value;
    }
}

export function isExternalBox(b: Box): b is AbstractExternalBox {
    return b instanceof AbstractExternalBox;
}
