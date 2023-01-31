import { FretTypeRule } from "./FretTypeRule";

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
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    readonly $typename: string = "FretInferenceRule"; // holds the metatype in the form of a string

    toFreString(): string {
        return `infertype ${this.exp.toFreString()};`;
    }

}
