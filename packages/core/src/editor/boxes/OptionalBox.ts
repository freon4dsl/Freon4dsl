import { computed, observable, makeObservable } from "mobx";

import { PiElement } from "../../ast";
import { Box, AliasBox, BoxFactory } from "./internal";

export type BoolFunctie = () => boolean;

/**
 * Box to indent another box with parameter "indent".
 */
export class OptionalBox extends Box {
    readonly kind = "OptionalBox";

    box: Box = null;
    whenNoShowingAlias: AliasBox = null; // TODO question: should name be whenShowingAlias or alternativeBox?
    mustShow: boolean = false;
    condition: () => boolean;

    constructor(element: PiElement, role: string, condition: BoolFunctie, box: Box, mustShow: boolean, aliasText: string) {
        super(element, role);
        // makeObservable(this, {
        //     box: observable,
        //     whenNoShowingAlias: observable,
        //     mustShow: observable,
        //     showByCondition: computed
        // });
        this.box = box;
        box.parent = this;
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
    return b.kind === "OptionalBox"; // b instanceof OptionalBox;
}
