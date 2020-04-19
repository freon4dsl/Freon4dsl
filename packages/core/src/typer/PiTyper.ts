import { PiElement } from "../language";

// Part of the ProjectIt Framework.

export interface PiTyper {
    // returns the type of 'modelelement' according to the type rules in the Typer Definition
    inferType(modelelement: PiElement): PiElement;

    equalsType(elem1: PiElement, elem2: PiElement): boolean; // strict equals

    conformsTo(elem1: PiElement, elem2: PiElement): boolean; // elem1 <= elem2 conformance direction

    conformList(typelist1: PiElement[], typelist2: PiElement[]): boolean;

    isType(elem: PiElement): boolean;
}
