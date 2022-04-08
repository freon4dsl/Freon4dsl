// Generated by the ProjectIt Language Generator.

import { PitTypeRule } from "./PitTypeRule";

/**
 * Class PitEqualsRule is the implementation of the concept with the same name in the language definition file.
 * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react
 * to changes in the state of its properties.
 */
export class PitEqualsRule extends PitTypeRule {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitEqualsRule>): PitEqualsRule {
        const result = new PitEqualsRule();
        if (!!data.exp) {
            result.exp = data.exp;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }

    readonly $typename: string = "PitEqualsRule"; // holds the metatype in the form of a string
    toPiString(): string {
        return "equalsto " + this.exp.toPiString() + ";";
    }
}
