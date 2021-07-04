import { observable } from "mobx";
import { SBox } from "./SBox";

export class SLabelBox extends SBox {
    @observable text: string;
    kind = "LabelBox";

    constructor(s: string) {
        super();
        this.text = s;
    }
}

export function isLabelBox(b: SBox): b is SLabelBox {
    return b.kind === "LabelBox";
}

export function changeText(box: SLabelBox, text: string) {
    box.text = text;
}

