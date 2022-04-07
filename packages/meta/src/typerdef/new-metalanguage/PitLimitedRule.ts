import { PitTypeRule } from "./PitTypeRule";

export class PitLimitedRule extends PitTypeRule {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitLimitedRule>): PitLimitedRule {
        const result = new PitLimitedRule();
        if (!!data.exp) {
            result.exp = data.exp;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    readonly $typename: string = "PitLimitedRule"; // holds the metatype in the form of a string

    toPiString(): string {
        return `${this.exp.toPiString()}`;
    }
}
