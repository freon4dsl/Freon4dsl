import { observable } from "mobx";

import { Box } from "./internal";
import { PiUtils } from "../../util";
import { PiElement } from "../../language";

export class LabelBox extends Box {
    readonly kind = "LabelBox";

    @observable private readonly $label: string;

    constructor(element: PiElement, role: string, getLabel: string | (() => string), initializer?: Partial<LabelBox>) {
        super(element, role);
        PiUtils.initializeObject(this, initializer);
        if (typeof getLabel === "function") {
            this.getLabel = getLabel;
        } else if (typeof getLabel === "string") {
            this.$label = getLabel;
        } else {
            throw new Error("LabelBox: incorrect label type");
        }
    }

    getLabel(): string {
        return this.$label;
    }
}

export function isLabelBox(b: Box): b is LabelBox {
    return b.kind === "LabelBox"; // b instanceof LabelBox;
}
