import type { FreNode } from "../ast/index.js";
import type { FreType } from "./FreType.js";

export interface FreTyper {
    // name: string;
    mainTyper: FreTyper;

    /**
     * Returns true if 'elem' is marked as 'isType' in the Typer definition.
     * Returns undefined when this typer instance cannot determine the outcome.
     * @param elem
     */
    isType(elem: FreNode): boolean | undefined;

    /**
     * Returns the type of 'modelelement' according to the type rules in the Typer Definition.
     * Returns undefined when this typer instance cannot determine the outcome.
     * @param modelelement
     */
    inferType(modelelement: FreNode): FreType | undefined;

    /**
     * Returns true if type1 equals type2.
     * This is a strict equal.
     * Returns undefined when this typer instance cannot determine the outcome.
     * @param type1
     * @param type2
     */
    equals(type1: FreType, type2: FreType): boolean | undefined;

    /**
     * Returns true if type1 conforms to type2. The direction is type1 conforms to type2.
     * Returns undefined when this typer instance cannot determine the outcome.
     * @param type1
     * @param type2
     */
    conforms(type1: FreType, type2: FreType): boolean | undefined;

    /**
     * Returns true if all types in typelist1 conform to the types in typelist2, in the given order.
     * Returns undefined when this typer instance cannot determine the outcome.
     * @param typelist1
     * @param typelist2
     */
    conformsList(typelist1: FreType[], typelist2: FreType[]): boolean | undefined;

    /**
     * Returns the common super type of all types in 'typelist'.
     * Returns undefined when this typer instance cannot determine the outcome.
     * @param typelist
     */
    commonSuper(typelist: FreType[]): FreType | undefined;

    /**
     * Returns all super types as defined in the typer definition.
     * Returns undefined when this typer instance cannot determine the outcome.
     * @param type
     */
    getSuperTypes(type: FreType): FreType[] | undefined;
}
