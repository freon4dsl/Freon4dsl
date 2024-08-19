import { FreNode } from "../ast";
import { FreType } from "./FreType";

export interface FreTyper {
    // name: string;
    mainTyper: FreTyper;

    /**
     * Returns true if 'elem' is marked as 'isType' in the Typer definition
     * @param elem
     */
    isType(elem: FreNode): boolean;

    /**
     * Returns the type of 'modelelement' according to the type rules in the Typer Definition
     * @param modelelement
     */
    inferType(modelelement: FreNode): FreType | null;

    /**
     * Returns true if type1 equals type2.
     * This is a strict equal.
     * @param type1
     * @param type2
     */
    equals(type1: FreType, type2: FreType): boolean | null;

    /**
     * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
     * @param type1
     * @param type2
     */
    conforms(type1: FreType, type2: FreType): boolean | null;

    /**
     * Returns true if all types in typelist1 conform to the types in typelist2, in the given order.
     * @param typelist1
     * @param typelist2
     */
    conformsList(typelist1: FreType[], typelist2: FreType[]): boolean | null;

    /**
     * Returns the common super type of all types in typelist
     * @param typelist
     */
    commonSuper(typelist: FreType[]): FreType | null;

    /**
     * Returns all super types as defined in the typer definition.
     * @param type
     */
    getSuperTypes(type: FreType): FreType[] | null;
}
