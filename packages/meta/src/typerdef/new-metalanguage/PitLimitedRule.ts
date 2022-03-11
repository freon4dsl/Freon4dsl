import { PitStatement } from "./expressions";
import { PitClassifierRule } from "./PitClassifierRule";

export class PitLimitedRule extends PitClassifierRule {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitLimitedRule>): PitLimitedRule {
        const result = new PitLimitedRule();
        if (!!data.statements) {
            data.statements.forEach(x => result.statements.push(x));
        }
        if (!!data.myClassifier) {
            result.myClassifier = data.myClassifier;
        }
        if (!!data.__myClassifier) {
            result.__myClassifier = data.__myClassifier;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    statements: PitStatement[] = [];
    toPiString(): string {
        return `${this.__myClassifier.name} { 
            ${this.statements.map( t => t.toPiString() ).join("\n")}
             }`;
    }
}
