import { PiElement } from "../language";

// Part of the ProjectIt Framework.
// tag::validator-interface[]
export interface PiValidator {
    /**
     * Returns a list of errors on 'modelelement' according to the validation rules
     * stated in the validation definition. If 'includeChildren' is true, the child
     * nodes of 'modelelement' in the AST are also checked.
     *
     * @param modelelement
     * @param includeChildren
     */
    validate(modelelement: PiElement, includeChildren?: boolean): PiError[];
}

/**
 * An error consists of a message coupled to the faulty AST node, either a model
 * element or a list of model elements.
 */
export class PiError {
    message: string;
    reportedOn: PiElement | PiElement[];

    constructor(mess: string, elem: PiElement | PiElement[]) {
        this.message = mess;
        this.reportedOn = elem;
    }
}
// end::validator-interface[]
