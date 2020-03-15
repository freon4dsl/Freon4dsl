import { PiElement } from "../language";

// Part of the ProjectIt Framework.

export interface PiValidator {
    validate(modelelement: PiElement, includeChildren?: boolean): PiError[];
}

export class PiError {
    message: string;
    reportedOn: PiElement | PiElement[];

    constructor(mess: string, elem: PiElement | PiElement[]) {
        this.message = mess;
        this.reportedOn = elem;
    }
}
