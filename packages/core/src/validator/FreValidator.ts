import { FreNode } from "../ast";

// Part of the ProjectIt Framework.
export interface FreValidator {
    /**
     * Returns a list of errors on 'modelelement' according to the validation rules
     * stated in the validation definition. If 'includeChildren' is true, the child
     * nodes of 'modelelement' in the AST are also checked.
     *
     * @param modelelement
     * @param includeChildren
     */
    validate(modelelement: FreNode, includeChildren?: boolean): FreError[];
}

/**
 * An error consists of a message coupled to the faulty AST node, either a model
 * element or a list of model elements.
 */
export class FreError {
    message: string;                        // human-readable error message
    reportedOn: FreNode | FreNode[];    // the model element that does not comply
    propertyName: string;                   // the property of the model element that does not comply, if appropriate
    propertyIndex: number;                  // the property index of the model element that does not comply, if appropriate
    locationdescription: string;            // human-readable indication of 'reportedOn'
    severity: FreErrorSeverity;              // indication of how serious the error is, default is 'To Do'
    constructor(message: string, element: FreNode | FreNode[], locationdescription: string, propertyName: string, severity?: FreErrorSeverity, propertyIndex?: number) {
        // todo check whether propertyIndex is really needed
        this.message = message;
        this.reportedOn = element;
        this.locationdescription = locationdescription;
        if (!!severity) {
            this.severity = severity;
        } else {
            this.severity = FreErrorSeverity.ToDo;
        }
        this.propertyName = propertyName;
        this.propertyIndex = propertyIndex;
    }
}

// TODO combine these two Severities
export enum FreErrorSeverity {
    Error = "Error",
    Improvement = "Improvement",
    ToDo = "TODO",
    Info = "Info",
    NONE = "NONE"
}

// severity can range from 0 to 4
// 0 means information
// 1 means hint
// 2 means warning
// 3 means error
export enum SeverityType {
    info = 0,
    hint = 1,
    warning = 2,
    error= 3
}
