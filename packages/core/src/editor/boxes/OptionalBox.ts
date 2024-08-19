import { autorun } from "mobx";
import { FreNode } from "../../ast";
import { Box, ActionBox, BoxFactory } from "./internal";

export type BoolFunctie = () => boolean;

/**
 * OptionalBox holds the content from a projection that is optional. This content is always present in the
 * attribute 'content'. Next to the context there is a 'placeholder' box, which is shown when the content is not
 * present in the FreElement model.
 * The attributes 'mustShow' and 'condition' determine which of the pair [content, placeholder] is shown. If the 'condition'
 * results in true, then the content box is shown. If 'mustShow' is true, then the content box is also shown, even though
 * there may not be actual content within the FreElement model. The latter is set by the custom action, that is coupled
 * to this OptionalBox, which is triggered by the user.
 */
export class OptionalBox extends Box {
    readonly kind = "OptionalBox";

    content: Box = null;
    placeholder: ActionBox = null;
    _mustShow: boolean = false; // is set to true by action that does not (yet) change the model, but causes part of the optional to be shown
    condition: () => boolean; // a condition based on the model that determines whether the optional is shown

    get mustShow() {
        return this._mustShow;
    }
    set mustShow(v: boolean) {
        this._mustShow = v;
        this.isDirty();
    }

    constructor(
        element: FreNode,
        role: string,
        condition: BoolFunctie,
        box: Box,
        mustShow: boolean,
        actionText: string,
    ) {
        super(element, role);
        this.content = box;
        box.parent = this;
        // TODO question: should not the role be diff from role of this box? Where is the "action" prefix added?
        this.placeholder = BoxFactory.action(element, role, actionText);
        this.placeholder.parent = this;
        this.mustShow = mustShow;
        this.condition = condition;
        autorun(this.conditionChanged);
    }

    get showByCondition(): boolean {
        return this.condition();
    }

    conditionChanged = () => {
        console.log("AUTORUN showByCondition");
        this.condition();
        this.isDirty();
    };

    /**
     * Get the first selectable leaf box in the tree with `this` as root.
     */
    get firstLeaf(): Box {
        if (this.condition() || this.mustShow) {
            return this.content.firstLeaf;
        } else {
            return this.placeholder;
        }
    }

    get lastLeaf(): Box {
        if (this.condition() || this.mustShow) {
            return this.content.lastLeaf;
        } else {
            return this.placeholder;
        }
    }

    get firstEditableChild(): Box {
        if (this.condition() || this.mustShow) {
            return this.content.firstEditableChild;
        } else {
            return this.placeholder;
        }
    }

    get children(): ReadonlyArray<Box> {
        if (this.condition() || this.mustShow) {
            return [this.content];
        } else {
            return [this.placeholder];
        }
    }
}

export function isOptionalBox(b: Box): b is OptionalBox {
    return b?.kind === "OptionalBox"; // b instanceof OptionalBox;
}
