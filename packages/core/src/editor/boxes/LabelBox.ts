import { observable, makeObservable } from "mobx";

import { Box } from "./internal";
import { PiUtils } from "../../util";
import { PiElement } from "../../model";

export class LabelBox extends Box {
    readonly kind = "LabelBox";

    private $label: string = "";

    constructor(element: PiElement, role: string, getLabel: string | (() => string), initializer?: Partial<LabelBox>) {
        super(element, role);
        PiUtils.initializeObject(this, initializer);
        this.setLabel(getLabel);
        makeObservable<LabelBox, "$label">(this, {
            $label: observable
        });
    }

    setLabel(getLabel: string | (() => string)) {
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
