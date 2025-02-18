import type {FreModelUnit, ModelUnitIdentifier} from "@freon4dsl/core";

export interface stringList {
    list: string[];
}

// todo rethink the interfaces and the way the info is stored
export interface  UnitInfo {
    id: ModelUnitIdentifier | undefined;
    ref: FreModelUnit | undefined;
}

export interface UnitList {
    ids: ModelUnitIdentifier[];
    refs: FreModelUnit[];
}
