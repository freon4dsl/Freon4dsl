import { computed, observable } from "mobx";

import { PiElement } from "../../language/PiModel";
import { Box } from "./Box";
import { AliasBox } from "./AliasBox";

type BoolFunctie = () => boolean;
/**
 * Box to indent another box with parameter "indent".
 */
export class OptionalBox extends Box {
    readonly kind = "OptionalBox";

    @observable box: Box = null;
    @observable whenNoShowingAlias: AliasBox;
    @observable mustShow: boolean = false;
    condition: () => boolean;

    constructor(exp: PiElement, role: string, condition: BoolFunctie, box: Box, mustShow: boolean, aliasText: string) {
        super(exp, role);
        this.box = box;
        box.parent = this;
        this.whenNoShowingAlias = new AliasBox(exp, role, aliasText);
        this.whenNoShowingAlias.parent = this;
        this.mustShow = mustShow;
        this.condition = condition;
        this.selectable = false;
    }

    @computed
    get showByCondition(): boolean {
        return this.condition();
    }

    /**
     * Get the first selectable leaf box in the tree with `this` as root.
     */
    get firstLeaf(): Box {
        return this.box.firstLeaf;
    }

    get lastLeaf(): Box {
        return this.box.lastLeaf ;
    }

    get firstEditableChild(): Box {
        return this.box.firstEditableChild ;
    }

    get children(): ReadonlyArray<Box> {
        return [this.box] ;
    }
}

export function isOptionalBox(b: Box): b is OptionalBox {
    return b.kind === "OptionalBox"; // b instanceof OptionalBox;
}
