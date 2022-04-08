import { PiDefinitionElement } from "../../utils";
import { PitTypeRule } from "./PitTypeRule";

export class PitAnyTypeSpec extends PiDefinitionElement {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitAnyTypeSpec>): PitAnyTypeSpec {
        const result = new PitAnyTypeSpec();
        if (!!data.rules) {
            data.rules.forEach(x => result.rules.push(x));
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    readonly $typename: string = "PitAnyTypeSpec"; // holds the metatype in the form of a string

    rules: PitTypeRule[] = []; // implementation of part 'rules'

    toPiString(): string {
        return `anytype { ${this.rules.map( t => t.toPiString() ).join("\n")} }`;
    }
}
