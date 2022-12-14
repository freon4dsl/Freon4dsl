import { PiElement } from "../../ast";
import { Box, AliasBox, BoxFactory } from "./internal";

export type BoolFunctie = () => boolean;

/**
 * Box to indent another box with parameter "indent".
 */
export class OptionalBox extends Box {
    readonly kind = "OptionalBox";

    private _box: Box = null;
    whenNoShowingAlias: AliasBox = null; // TODO question: should name be whenShowingAlias or alternativeBox?
    condition: () => boolean;
    protected _mustShow: boolean = false;

    get box(): Box {
        return this._box;
    }
    set box(v: Box) {
        if (!!this._box) {
            this._box.parent = null;
        }
        this._box = v;
        if (!!this._box) {
            this._box.parent = this;
        }
        this.isDirty();
    }

    get mustShow() {
        return this._mustShow;
    }
    set mustShow(v: boolean) {
        this._mustShow = v;
        this.isDirty();
    }

    constructor(element: PiElement, role: string, condition: BoolFunctie, box: Box, mustShow: boolean, aliasText: string) {
        super(element, role);
        this.box = box;
        this.whenNoShowingAlias = BoxFactory.alias(element, role, aliasText); // TODO question: should not the role be diff from role of this box? Where is the "alias" prefix added?
        this.whenNoShowingAlias.parent = this;
        this.mustShow = mustShow;
        this.condition = condition;
        this.selectable = false;
    }

    get showByCondition(): boolean {
        return this.condition();
    }

    /**
     * Get the first selectable leaf box in the tree with `this` as root.
     */
    get firstLeaf(): Box {
        if (this.condition() || this.mustShow) {
            return this.box.firstLeaf;
        } else {
            return this.whenNoShowingAlias;
        }
    }

    get lastLeaf(): Box {
        if (this.condition() || this.mustShow) {
            return this.box.lastLeaf;
        } else {
            return this.whenNoShowingAlias;
        }
    }

    get firstEditableChild(): Box {
        if (this.condition() || this.mustShow) {
            return this.box.firstEditableChild;
        } else {
            return this.whenNoShowingAlias;
        }
    }

    get children(): ReadonlyArray<Box> {
        if (this.condition() || this.mustShow) {
            return [this.box];
        } else {
            return [this.whenNoShowingAlias];
        }
    }
}

export function isOptionalBox(b: Box): b is OptionalBox {
    return b?.kind === "OptionalBox"; // b instanceof OptionalBox;
}
