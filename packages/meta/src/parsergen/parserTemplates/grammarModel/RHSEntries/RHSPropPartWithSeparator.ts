import { RHSPropEntry } from "./RHSPropEntry";
import { FreProperty } from "../../../../languagedef/metalanguage";

export abstract class RHSPropPartWithSeparator extends RHSPropEntry {
    protected separatorText: string = "";

    protected constructor(prop: FreProperty, separatorText) {
        super(prop);
        this.separatorText = separatorText;
    }
}
