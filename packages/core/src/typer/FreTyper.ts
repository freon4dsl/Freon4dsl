import { PiElement } from "../ast/index";
import { PiType } from "./PiType";

export interface FreTyper {
    // name: string;
    mainTyper: FreTyper;
    
    /**
     * Returns true if 'elem' is marked as 'isType' in the Typer definition
     * @param elem
     */
    isType(elem: PiElement): boolean;

    /**
     * Returns the type of 'modelelement' according to the type rules in the Typer Definition
     * @param modelelement
     */
    inferType(modelelement: PiElement): PiType | null;

    /**
     * Returns true if type1 equals type2.
     * This is a strict equal.
     * @param type1
     * @param type2
     */
    equals(type1: PiType, type2: PiType): boolean | null;

    /**
     * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
     * @param type1
     * @param type2
     */
    conforms(type1: PiType, type2: PiType): boolean | null;

    /**
     * Returns true if all types in typelist1 conform to the types in typelist2, in the given order.
     * @param typelist1
     * @param typelist2
     */
    conformsList(typelist1: PiType[], typelist2: PiType[]): boolean | null;

    /**
     * Returns the common super type of all types in typelist
     * @param typelist
     */
    commonSuper(typelist: PiType[]): PiType | null;

    /**
     * Returns all super types as defined in the typer definition.
     * @param type
     */
    getSuperTypes(type: PiType): PiType[] | null;

}
