import { PiElement } from "../language";

// Part of the ProjectIt Framework.
// tag::unparser-interface[]
export interface PiUnparser {

    /** returns a string representation of 'modelelement' according to the
     * projections in the Editor Definition
     *
     * @param modelelement
     */
    unparse(modelelement: PiElement): string;
}
// end::unparser-interface[]
