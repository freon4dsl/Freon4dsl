import { PiElement } from "../language";

// Part of the ProjectIt Framework.

// tag::typer-interface[]
/**
 * This interface is being used to implement the three-tier approach.
 * Bothe the generated and custom type providers should implement this interface.
 * The generated class that implement the PiTyper interface connects all the classes
 * that implement this interface and returns the correct value to the (external) user.
 *
 * When the implementor of this interface does not provide for a result of one of the methods,
 * this method should return 'null'.
 */
export interface PiTyperPart {
    /**
     * Returns the type of 'modelelement' according to the type rules in the Typer Definition.
     * @param modelelement
     */
    inferType(modelelement: PiElement): PiElement | null;

    /**
     * Returns true if the type that inferType(elem1) returns equals the type inferType(elem2) returns.
     * This is a strict equal.
     * @param elem1
     * @param elem2
     */
    equalsType(elem1: PiElement, elem2: PiElement): boolean | null;

    /**
     * Returns true if the type that inferType(elem1) returns conforms to the type inferType(elem2) returns, according to
     * the type rules in the Typer definition. The direction is elem2 conforms to elem1.
     * @param elem1
     * @param elem2
     */
    conformsTo(elem1: PiElement, elem2: PiElement): boolean | null;

    /**
     * Returns true if all types in typelist1 conform to the types in typelist2, in the given order.
     * @param typelist1
     * @param typelist2
     */
    conformList(typelist1: PiElement[], typelist2: PiElement[]): boolean | null;

    /**
     * Returns true if 'elem' is marked as 'type' in the Typer definition.
     * @param elem
     */
    isType(elem: PiElement): boolean | null;
}
// end::typer-interface[]
