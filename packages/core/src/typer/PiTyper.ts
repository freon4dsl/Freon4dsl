import { PiElement } from "../language";
import { PiType } from "./PiType";

// Part of the ProjectIt Framework.

// tag::typer-interface[]
export interface PiTyper {

    /**
     * Returns true if 'elem' is marked as 'isType' in the Typer definition
     * @param elem
     */
    isType(elem: PiElement): boolean;

    /**
     * Returns the type of 'modelelement' according to the type rules in the Typer Definition
     * @param modelelement
     */
    inferType(modelelement: PiElement): PiType;

    /**
     * Returns true if the type that inferType(elem1) returns equals the type inferType(elem2) returns.
     * This is a strict equal.
     * @param elem1
     * @param elem2
     */
    equalsType(elem1: PiElement, elem2: PiElement): boolean;

    /**
     * Returns true if type1 equals type2.
     * This is a strict equal.
     * @param type1
     * @param type2
     */
    equals(type1: PiType, type2: PiType): boolean;

    /**
     * Returns true if the type that inferType(elem1) returns conforms to the type inferType(elem2) returns, according to
     * the type rules in the Typer definition. The direction is elem1 conforms to elem2.
     * @param elem1
     * @param elem2
     */
    conformsType(elem1: PiElement, elem2: PiElement): boolean;

    /**
     * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
     * @param type1
     * @param type2
     */
    conforms(type1: PiType, type2: PiType): boolean;

    /**
     * Returns true if all types of the elements in elemlist1 conform to the types of the elements in elemlist2, in the given order.
     * @param elemlist1
     * @param elemlist2
     */
    conformsListType(elemlist1: PiElement[], elemlist2: PiElement[]): boolean;

    /**
     * Returns true if all types in typelist1 conform to the types in typelist2, in the given order.
     * @param typelist1
     * @param typelist2
     */
    conformsList(typelist1: PiType[], typelist2: PiType[]): boolean;

    /**
     * Returns the common super type of all elements in elemlist
     * @param elemlist
     */
    commonSuperType(elemlist: PiElement[]): PiType;

    /**
     * Returns the common super type of all types in typelist
     * @param typelist
     */
    commonSuper(typelist: PiType[]): PiType;
}
// end::typer-interface[]
