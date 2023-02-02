import { RightHandSideEntry } from "./RightHandSideEntry";
import { FreProperty } from "../../../../languagedef/metalanguage";

export abstract class RHSPropEntry extends RightHandSideEntry {
    property: FreProperty;

    constructor(prop: FreProperty) {
        super();
        this.property = prop;
    }
}
