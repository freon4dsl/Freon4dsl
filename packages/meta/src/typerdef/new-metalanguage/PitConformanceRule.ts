// Generated by the ProjectIt Language Generator.
import { PitTypeRule } from "./PitTypeRule";

/**
 * Class PitConformanceRule is the implementation of the concept with the same name in the language definition file.
 * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react
 * to changes in the state of its properties.
 */
export class PitConformanceRule extends PitTypeRule {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitConformanceRule>): PitConformanceRule {
        const result = new PitConformanceRule();
        if (!!data.exp) {
            result.exp = data.exp;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }

    readonly $typename: string = "PitConformanceRule"; // holds the metatype in the form of a string
    toPiString(): string {
        return "conformsto " + this.exp.toPiString() + ";";
    }
}
