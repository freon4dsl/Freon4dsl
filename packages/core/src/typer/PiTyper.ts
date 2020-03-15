import { PiElement } from "../language";

// Part of the ProjectIt Framework.

export interface PiTyper {

    // returns the type of 'modelelement' according to the type rules in the Typer Definition
    inferType(modelelement: PiElement): PiElement;

    conform(type1: PiElement, type2: PiElement): boolean; // type 1 <= type 2 conformance direction

    conformList(typelist1: PiElement[], typelist2: PiElement[]): boolean;

    isType(elem: PiElement): boolean;
}
