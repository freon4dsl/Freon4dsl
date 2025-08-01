import { Box } from "../Box.js";
import type { FreNode } from "../../../ast/index.js";
import { FreUtils } from "../../../util/index.js";
import { AbstractExternalBox } from "./AbstractExternalBox.js";

/**
 * This class represents an external component that may have a Freon native component as child projection.
 * The child can be any projection, like a horizontal list.
 *
 * Note that it should not be used to show a single property. Other external boxes, like ExternalPartBox,
 * are more suited for this purpose.
 */
export class FragmentWrapperBox extends AbstractExternalBox {
    readonly kind: string = "FragmentWrapperBox";
    private _childBox: Box;

    constructor(
        externalComponentName: string,
        node: FreNode,
        role: string,
        childBox: Box,
        initializer?: Partial<FragmentWrapperBox>,
    ) {
        super(externalComponentName, node, role);
        FreUtils.initializeObject(this, initializer);
        this._childBox = childBox;
        this._childBox.parent = this;
    }

    get childBox(): Box {
        return this._childBox;
    }

    get children(): ReadonlyArray<Box> {
        return [this._childBox] as ReadonlyArray<Box>;
    }
}

export function isFragmentWrapperBox(b: Box): b is FragmentWrapperBox {
    return b?.kind === "FragmentWrapperBox"; // b instanceof FragmentWrapperBox;
}
