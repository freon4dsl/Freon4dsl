import {Box} from "./Box";
import {FreNode} from "../../ast";
import {FreUtils} from "../../util";

export type KeyValuePair = {
    key: string;
    value: string;
}

export class ExternalBox extends Box {
    readonly kind: string = "ExternalBox";
    private readonly _externalComponentName: string = "unknownComponent";
    private _children: Box[] = [];
    params: KeyValuePair[] = [];

    constructor(externalComponentName: string, node: FreNode, role: string, children?: Box[], initializer?: Partial<ExternalBox>) {
        super(node, role);
        this._externalComponentName = externalComponentName;
        FreUtils.initializeObject(this, initializer);
        if (!!children) {
            children.forEach(b => this.addChildNoDirty(b));
        }
    }

    /**
     * To be used when adding multiple children in one go, avoiding spurious isDirty() calls.
     * @param child
     * @private
     */
    private addChildNoDirty(child: Box | null) {
        if (!!child) {
            this._children.push(child);
            child.parent = this;
        }
    }

    get children(): ReadonlyArray<Box> {
        return this._children as ReadonlyArray<Box>;
    }

    get externalComponentName(): string {
        return this._externalComponentName;
    }

    findParam(key: string): string {
        return this.params.find(pair => pair.key === key).value;
    }

    // todo do we need more of the replace children functionality like in LayoutComponent??
}

export function isExternalBox(b: Box): b is ExternalBox {
    return b?.kind === "ExternalBox"; // b instanceof ExternalBox;
}
