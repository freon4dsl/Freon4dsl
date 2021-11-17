import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";

export abstract class RHSPropPartWithSeparator extends RHSPropEntry {
    protected separatorText: string = "";

    constructor(prop: PiProperty, separatorText) {
        super(prop);
        this.separatorText = separatorText;
    }
}
