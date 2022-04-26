// Generated by the ProjectIt Language Generator.

import { PitTypeRule } from "./PitTypeRule";
import { PiClassifier, PiElementReference } from "../../languagedef/metalanguage";
import { PiTyperDef } from "./PiTyperDef";
import { PiTyperElement } from "./PiTyperElement";

/**
 * Class PitClassifierSpec is the implementation of the concept with the same name in the language definition file.
 */
export class PitClassifierSpec extends PiTyperElement {
    owner: PiTyperDef;
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitClassifierSpec>): PitClassifierSpec {
        const result = new PitClassifierSpec();
        if (!!data.rules) {
            data.rules.forEach(x => result.rules.push(x));
        }
        if (!!data.__myClassifier) {
            result.__myClassifier = data.__myClassifier;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }

    readonly $typename: string = "PitClassifierSpec"; // holds the metatype in the form of a string
    $id: string; // a unique identifier

    rules: PitTypeRule[] = []; // implementation of part 'rules'
    __myClassifier: PiElementReference<PiClassifier>; // implementation of reference 'myClassifier'

    /**
     * Convenience method for reference 'myClassifier'.
     * Instead of returning a 'PiElementReference<PiClassifier>' object,
     * it returns the referred 'PiClassifier' object, if it can be found.
     */
    get myClassifier(): PiClassifier {
        if (!!this.__myClassifier) {
            return this.__myClassifier.referred;
        }
        return null;
    }
    toPiString(): string {
        return this.__myClassifier.name + " {\n\t" + this.rules.map(r => r.toPiString()).join("\n\t") + "\n} ";
    }
}