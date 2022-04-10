import { PitTypeRule } from "./PitTypeRule";

export class PitInferenceRule extends PitTypeRule {

    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitInferenceRule>): PitInferenceRule {
        const result = new PitInferenceRule();
        if (!!data.exp) {
            result.exp = data.exp;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    readonly $typename: string = "PitInferenceRule"; // holds the metatype in the form of a string

    toPiString(): string {
        return `infertype ${this.exp.toPiString()};`;
    }

}
