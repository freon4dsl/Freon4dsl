import { PiElement } from "../language";
import { PiTyper } from "./PiTyper";
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
export interface PiTyperPart {

    /**
     * A reference to the main typer of which this typer part is a part.
     */
    mainTyper: PiTyper;

    /**
     * Returns true if 'modelelement' is marked as 'type' in the Typer definition.
     * @param modelelement
     */
    isType(modelelement: PiElement): boolean | null;

    /**
     * Returns the type of 'modelelement' according to the type rules in the Typer Definition.
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
}
