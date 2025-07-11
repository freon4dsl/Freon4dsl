import type {FreModelUnit, FreUnitIdentifier} from "@freon4dsl/core";

export interface stringList {
    list: string[];
}

// todo rethink the interfaces and the way the info is stored
export interface  UnitInfo {
    id: FreUnitIdentifier | undefined;
    ref: FreModelUnit | undefined;
}

export interface UnitList {
    ids: FreUnitIdentifier[];
    refs: FreModelUnit[];
}
