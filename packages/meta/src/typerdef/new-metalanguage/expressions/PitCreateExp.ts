// Generated by the ProjectIt Language Generator.

import { PitExp } from "./PitExp";
import { PitPropInstance } from "../PitPropInstance";
import { PiClassifier, PiElementReference } from "../../../languagedef/metalanguage";

/**
 * Class PitCreateExp is the implementation of the concept with the same name in the language definition file.
 * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react
 * to changes in the state of its properties.
 */
export class PitCreateExp extends PitExp  {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitCreateExp>): PitCreateExp {
        const result = new PitCreateExp();
        if (!!data.propertyDefs) {
            data.propertyDefs.forEach(x => result.propertyDefs.push(x));
        }
        if (!!data.__type) {
            result.__type = data.__type;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }

    readonly $typename: string = "PitCreateExp"; // holds the metatype in the form of a string

    propertyDefs: PitPropInstance[]; // implementation of part 'propertyDefs'
    __type: PiElementReference<PiClassifier>; // implementation of reference 'type'

     /**
     * Convenience method for reference 'type'.
     * Instead of returning a 'PiElementReference<PiClassifier>' object,
     * it returns the referred 'PiClassifier' object, if it can be found.
     */
    get type(): PiClassifier {
        if (!!this.__type) {
            return this.__type.referred;
        }
        return null;
    }
    toPiString(): string {
        return this.type + " { " + this.propertyDefs.map(p => p.toPiString()).join(",\n") + '\n} ';
    }
}
