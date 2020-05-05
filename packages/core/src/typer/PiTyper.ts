import { PiElement } from "../language";

// Part of the ProjectIt Framework.

export interface PiTyper {
    /**
     * Returns the type of 'modelelement' according to the type rules in the Typer Definition
     * @param modelelement
     */
    inferType(modelelement: PiElement): PiElement;

    /**
     * Returns true if the type that inferType(elem1) returns equals the type inferType(elem2) returns.
     * This is a strict equal.
     * @param elem1
     * @param elem2
     */
    equalsType(elem1: PiElement, elem2: PiElement): boolean;

    /**
     * Returns true if the type that inferType(elem1) returns conforms to the type inferType(elem2) returns, according to
     * the type rules in the Typer definition. The direction is elem2 conforms to elem1.
     * @param elem1
     * @param elem2
     */
    conformsTo(elem1: PiElement, elem2: PiElement): boolean;

    /**
     * Returns true if all types in typelist1 conform to the types in typelist2, in the given order.
     * @param typelist1
     * @param typelist2
     */
    conformList(typelist1: PiElement[], typelist2: PiElement[]): boolean;

    /**
     * Returns true if 'elem' is marked as 'type' in the Typer definition
     * @param elem
     */
    isType(elem: PiElement): boolean;
}
