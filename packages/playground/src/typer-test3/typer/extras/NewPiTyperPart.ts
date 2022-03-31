import { NewPiTyper } from "./NewPiTyper";
import { PiElement } from "@projectit/core";
import { PiType } from "./PiType";

// Part of the ProjectIt Framework.

/**
 * This interface is being used to implement the three-tier approach.
 * Both the generated and custom type providers should implement this interface.
 * The generated class that implement the PiTyper interface connects all the classes
 * that implement this interface and returns the correct value to the (external) user.
 *
 * When the implementor of this interface does not provide for a result of one of the methods,
 * this method should return 'null'.
 */
export interface NewPiTyperPart {
    mainTyper: NewPiTyper;

    inferType(modelelement: PiElement): PiType | null;
    equalsType(elem1: PiElement, elem2: PiElement): boolean | null;
    equals(type1: PiType, type2: PiType): boolean | null;
    conformsType(elem1: PiElement, elem2: PiElement): boolean | null;
    conforms(type1: PiType, type2: PiType): boolean | null;
    conformListType(typelist1: PiElement[], typelist2: PiElement[]): boolean | null;
    conformList(type1: PiType[], type2: PiType[]): boolean | null;
    isType(elem: PiElement): boolean | null;
    commonSuperType(typelist: PiType[]): PiType | null;
    commonSuper(elemlist: PiElement[]): PiType | null;
}
