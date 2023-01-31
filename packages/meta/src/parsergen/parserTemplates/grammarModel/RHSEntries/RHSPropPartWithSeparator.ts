import { RHSPropEntry } from "./RHSPropEntry";
import { FreProperty } from "../../../../languagedef/metalanguage";

export abstract class RHSPropPartWithSeparator extends RHSPropEntry {
    protected separatorText: string = "";

    constructor(prop: FreProperty, separatorText) {
        super(prop);
        this.separatorText = separatorText;
    }
}
