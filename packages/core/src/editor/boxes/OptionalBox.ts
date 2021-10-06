import { computed, observable, makeObservable } from "mobx";

import { PiElement } from "../../language/";
import { Box, AliasBox } from "./internal";

export type BoolFunctie = () => boolean;
/**
 * Box to indent another box with parameter "indent".
 */
export class OptionalBox extends Box {
    readonly kind = "OptionalBox";

    box: Box = null;
    whenNoShowingAlias: AliasBox = null;
    mustShow: boolean = false;
    condition: () => boolean;

    constructor(element: PiElement, role: string, condition: BoolFunctie, box: Box, mustShow: boolean, aliasText: string) {
        super(element, role);
        makeObservable(this, {
            box: observable,
            whenNoShowingAlias: observable,
            mustShow: observable,
            showByCondition: computed
        });
        this.box = box;
        box.parent = this;
        this.whenNoShowingAlias = new AliasBox(element, role, aliasText);
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
        if( this.condition()) {
            return this.box.firstLeaf ;
        } else {
            return null;
        }
    }

    get lastLeaf(): Box {
        if( this.condition()) {
            return this.box.lastLeaf ;
        } else {
            return null;
        }
    }

    get firstEditableChild(): Box {
        if( this.condition()) {
            return this.box.firstEditableChild ;
        } else {
            return null;
        }
    }

    get children(): ReadonlyArray<Box> {
        if( this.condition()) {
            return [this.box];
        } else {
            return [];
        }
    }
}

export function isOptionalBox(b: Box): b is OptionalBox {
    return b.kind === "OptionalBox"; // b instanceof OptionalBox;
}
