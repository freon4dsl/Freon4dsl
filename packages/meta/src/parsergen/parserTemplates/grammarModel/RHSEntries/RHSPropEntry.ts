import { RightHandSideEntry } from "./RightHandSideEntry";
import { FreMetaProperty } from "../../../../languagedef/metalanguage";

export abstract class RHSPropEntry extends RightHandSideEntry {
    property: FreMetaProperty;

    protected constructor(prop: FreMetaProperty) {
        super();
        this.property = prop;
    }
}
