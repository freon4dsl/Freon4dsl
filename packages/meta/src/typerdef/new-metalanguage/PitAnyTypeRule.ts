import { PiDefinitionElement } from "../../utils";
import { PitSingleRule } from "./PitSingleRule";

export class PitAnyTypeRule extends PiDefinitionElement {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitAnyTypeRule>): PitAnyTypeRule {
        const result = new PitAnyTypeRule();
        if (!!data.myRules) {
            data.myRules.forEach(x => result.myRules.push(x));
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    myRules: PitSingleRule[] = [];
    toPiString(): string {
        return `anytype { ${this.myRules.map( t => t.toPiString() ).join("\n")} }`;
    }
}
