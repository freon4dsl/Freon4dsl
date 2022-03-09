import { PitSingleRule } from "./PitSingleRule";
import { PitClassifierRule } from "./PitClassifierRule";

export class PitConformanceOrEqualsRule extends PitClassifierRule {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitConformanceOrEqualsRule>): PitConformanceOrEqualsRule {
        const result = new PitConformanceOrEqualsRule();
        if (!!data.myRules) {
            data.myRules.forEach(x => result.myRules.push(x));
        }
        if (!!data.myClassifier) {
            result.myClassifier = data.myClassifier;
        }
        if (!!data.__myClassifier) {
            result.__myClassifier = data.__myClassifier;
        }
        return result;
    }
    myRules: PitSingleRule[] = [];
    toPiString(): string {
        return `${this.__myClassifier.name} { 
            ${this.myRules.map( t => t.toPiString() ).join("\n")}
             }`;
    }
}
