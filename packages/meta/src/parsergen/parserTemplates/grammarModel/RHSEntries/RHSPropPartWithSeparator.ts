import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";

export abstract class RHSPropPartWithSeparator extends RHSPropEntry {
    protected separatorText: string = "";

    protected constructor(prop: FreMetaProperty, separatorText: string) {
        super(prop);
        this.separatorText = separatorText;
    }
}
