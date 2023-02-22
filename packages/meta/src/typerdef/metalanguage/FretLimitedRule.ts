import { FretTypeRule } from "./FretTypeRule";

export class FretLimitedRule extends FretTypeRule {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretLimitedRule>): FretLimitedRule {
        const result = new FretLimitedRule();
        if (!!data.exp) {
            result.exp = data.exp;
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }
    readonly $typename: string = "FretLimitedRule"; // holds the metatype in the form of a string

    toFreString(): string {
        return `${this.exp.toFreString()};`;
    }
}
