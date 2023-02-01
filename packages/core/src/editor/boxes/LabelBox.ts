import { Box } from "./internal";
import { PiUtils } from "../../util";
import { PiElement } from "../../ast";

export class LabelBox extends Box {
    readonly kind = "LabelBox";

    private $label: string = "";

    constructor(element: PiElement, role: string, getLabel: string | (() => string), initializer?: Partial<LabelBox>) {
        super(element, role);
        this.selectable = false; // default
        PiUtils.initializeObject(this, initializer);
        this.setLabel(getLabel);
    }

    setLabel(getLabel: string | (() => string)) {
        if (typeof getLabel === "function") {
            if (this.getLabel !== getLabel) {
                this.getLabel = getLabel;
                this.isDirty();
            }
        } else if (typeof getLabel === "string") {
            if (this.$label !== getLabel) {
                this.$label = getLabel;
                this.isDirty();
            }
        } else {
            throw new Error("LabelBox: incorrect label type");
        }
    }

    getLabel(): string {
        return this.$label;
    }
}

export function isLabelBox(b: Box): b is LabelBox {
    return b?.kind === "LabelBox"; // b instanceof LabelBox;
}
