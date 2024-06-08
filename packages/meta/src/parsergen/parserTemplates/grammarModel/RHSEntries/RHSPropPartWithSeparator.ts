import { RHSPropEntry } from "./RHSPropEntry";
import { FreMetaProperty } from "../../../../languagedef/metalanguage";

export abstract class RHSPropPartWithSeparator extends RHSPropEntry {
    protected separatorText: string = "";

    protected constructor(prop: FreMetaProperty, separatorText: string) {
        super(prop);
        this.separatorText = separatorText;
    }
}
