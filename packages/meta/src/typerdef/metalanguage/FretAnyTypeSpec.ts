import { FreTyperElement } from "./FreTyperElement.js";
import { FretTypeRule } from "./FretTypeRule.js";

export class FretAnyTypeSpec extends FreTyperElement {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretAnyTypeSpec>): FretAnyTypeSpec {
        const result = new FretAnyTypeSpec();
        if (!!data.rules) {
            data.rules.forEach((x) => result.rules.push(x));
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }
    readonly $typename: string = "FretAnyTypeSpec"; // holds the metatype in the form of a string

    rules: FretTypeRule[] = []; // implementation of part 'rules'

    toFreString(): string {
        return `anytype { ${this.rules.map((t) => t.toFreString()).join("\n")} }`;
    }
}
