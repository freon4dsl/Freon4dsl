import { FretTypeRule } from "./FretTypeRule.js";

export class FretInferenceRule extends FretTypeRule {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretInferenceRule>): FretInferenceRule {
        const result = new FretInferenceRule();
        if (!!data.exp) {
            result.exp = data.exp;
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }
    readonly $typename: string = "FretInferenceRule"; // holds the metatype in the form of a string

    toFreString(): string {
        return `infertype ${this.exp.toFreString()};`;
    }
}
