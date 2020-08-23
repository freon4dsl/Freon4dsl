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

export enum PiErrorSeverity {
    NONE = "NONE",
    Error = "Error",
    ToDo = "TODO",
    Info = "Info"
}

/**
 * An error consists of a message coupled to the faulty AST node, either a model
 * element or a list of model elements.
 */
export class PiError {
    message: string;                        // human-readable error message
    reportedOn: PiElement | PiElement[];    // the model element that does not comply
    locationdescription: string;            // human-readable indication of 'reportedOn'
    severity: PiErrorSeverity;              // indication of how serious the error is, default is 'ToDo'

    constructor(mess: string, elem: PiElement | PiElement[], locationdescription: string, severity?: PiErrorSeverity) {
        this.message = mess;
        this.reportedOn = elem;
        this.locationdescription = locationdescription;
        if (!!severity) {
            this.severity = severity;
        } else {
            this.severity = PiErrorSeverity.ToDo;
        }
    }
}
// end::validator-interface[]
