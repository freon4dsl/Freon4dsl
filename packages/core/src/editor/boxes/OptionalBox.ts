import { computed, observable, makeObservable } from "mobx";

import { PiElement } from "../../ast";
import { Box, ActionBox, BoxFactory } from "./internal";

export type BoolFunctie = () => boolean;

/**
 * Box to indent another box with parameter "indent".
 */
export class OptionalBox extends Box {
    readonly kind = "OptionalBox";

    box: Box = null;
    placeholder: ActionBox = null;
    mustShow: boolean = false;  // is set to true by action that does not (yet) change the model, but causes part of the optional to be shown
    condition: () => boolean;   // a condition based on the model that determines whether the optional is shown

    constructor(element: PiElement, role: string, condition: BoolFunctie, box: Box, mustShow: boolean, aliasText: string) {
        // TODO remove mustShow from params, as it is always false?
        super(element, role);
        makeObservable(this, {
            box: observable,
            placeholder: observable,
            mustShow: observable,
            showByCondition: computed
        });
        this.box = box;
        box.parent = this;
        this.placeholder = BoxFactory.action(element, role, aliasText); // TODO question: should not the role be diff from role of this box? Where is the "alias" prefix added?
        this.placeholder.parent = this;
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
            return this.placeholder;
        }
    }

    get lastLeaf(): Box {
        if (this.condition() || this.mustShow) {
            return this.box.lastLeaf;
        } else {
            return this.placeholder;
        }
    }

    get firstEditableChild(): Box {
        if (this.condition() || this.mustShow) {
            return this.box.firstEditableChild;
        } else {
            return this.placeholder;
        }
    }

    get children(): ReadonlyArray<Box> {
        if (this.condition() || this.mustShow) {
            return [this.box];
        } else {
            return [this.placeholder];
        }
    }
}

export function isOptionalBox(b: Box): b is OptionalBox {
    return b.kind === "OptionalBox"; // b instanceof OptionalBox;
}
