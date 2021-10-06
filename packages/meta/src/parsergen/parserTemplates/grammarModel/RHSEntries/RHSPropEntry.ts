import { RightHandSideEntry } from "./RightHandSideEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";

export abstract class RHSPropEntry extends RightHandSideEntry {
    property: PiProperty;

    constructor(prop: PiProperty) {
        super();
        this.property = prop;
    }
}
