import { PiType } from "./PiType";
import { PiElement } from "@projectit/core";

export interface NewPiTyper {
    inferType(modelelement: PiElement): PiType;
    equalsType(elem1: PiElement, elem2: PiElement): boolean;
    equals(type1: PiType, type2: PiType): boolean;
    conformsType(elem1: PiElement, elem2: PiElement): boolean;
    conformsTo(type1: PiType, type2: PiType): boolean;
    conformListType(typelist1: PiElement[], typelist2: PiElement[]): boolean;
    conformList(type1: PiType[], type2: PiType[]): boolean;
    isType(elem: PiElement): boolean;
    commonSuperType(typelist: PiType[]): PiType;
    commonSuper(elemlist: PiElement[]): PiType;
}

