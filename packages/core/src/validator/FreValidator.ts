import type { FreNode } from "../ast/index.js";
import { isNullOrUndefined, notNullOrUndefined } from "../util/index.js"

// Part of the Freon Framework.
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
    message: string; // human-readable error message
    reportedOn: FreNode | FreNode[]; // the model element that does not comply
    propertyName: string; // the property of the model element that does not comply, if appropriate
    propertyIndex: number; // the property index of the model element that does not comply, if appropriate
    locationDescription: string[]; // human-readable indication of 'reportedOn'
    severity: FreErrorSeverity; // indication of how serious the error is, default is 'To Do'

    constructor(
        message: string,
        node: FreNode | FreNode[],
        propertyName: string,
        severity?: FreErrorSeverity,
        propertyIndex?: number,
    ) {
        this.message = message;
        this.reportedOn = node;
        this.locationDescription = errorLocation(node);
        // TODO Check typeof
        if (typeof severity !== "undefined") {
            this.severity = severity;
        } else {
            this.severity = FreErrorSeverity.ToDo;
        }
        this.propertyName = propertyName;
        this.propertyIndex = propertyIndex;
    }
}

export enum FreErrorSeverity {
    Error = "Error",
    Warning = "Warning",
    Hint = "Hint",
    Improvement = "Improvement",
    ToDo = "TODO",
    Info = "Info",
    NONE = "NONE",
}

/**
 * This function returns information about the location of 'node' within the model.
 * If 'node' has a name property, the value of this property is returned, i.e. the value that
 * resides at the model level. If not, the name of the property as used in the AST definition
 * (a value at the metamodel level) is pushed onto the result, and its containing node
 * (parent) is searched for a name in the same manner, until a valid name property is found.
 *
 * The result is an array of property names from the AST definition, and one valid name from
 * the model, if this can be found.
 *
 * @param node
 */
export function errorLocation(node: FreNode | FreNode[]): string[] {
    if (isNullOrUndefined(node)) {
        return ["NO NODE"]
    }
    if (Array.isArray(node)) {
        return errorLocation(node[0]); // todo find better error location for erroneous array
    } else {
        // see if 'node' has a 'name' property
        const nodeName: string = node["name"];
        if (notNullOrUndefined(nodeName) && nodeName.length > 0) {
            return [nodeName];
        }

        if (!node.freIsModel()) {
            // search parent for 'name' property
            const nodeInfo = node.freOwnerDescriptor()
            if (isNullOrUndefined(nodeInfo)) {
                return ["NO OWNER"]
            }
            const propName = nodeInfo.propertyName
            const propIndex = nodeInfo.propertyIndex
            const propOwner = node.freOwner()
            if (isNullOrUndefined(propOwner)) {
                return ["NO OWNER"]
            }
            // recursive call
            const ownerLocation: string[] = errorLocation(propOwner)
            ownerLocation.push(`${propName}${propIndex >= 0 ? `[${propIndex}]` : ``}`)
            return ownerLocation
        } else {
            return ["NO NAME FOUND"]
        }
    }
}
