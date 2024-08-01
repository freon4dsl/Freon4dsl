import { RightHandSideEntry } from "./RightHandSideEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";

export abstract class RHSPropEntry extends RightHandSideEntry {
    property: FreMetaProperty;

    protected constructor(prop: FreMetaProperty) {
        super();
        this.property = prop;
    }
}
