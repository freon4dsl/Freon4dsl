import { PitExp } from "./expressions/PitExp";
import { PitClassifierRule } from "./PitClassifierRule";
import { PiClassifier, PiElementReference } from "../../languagedef/metalanguage";

export class PitInferenceRule extends PitClassifierRule {
    __returnType: PiElementReference<PiClassifier>;
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
    exp: PitExp;
    toPiString(): string {
        return `${this.__myClassifier.name} { infertype ${this.exp.toPiString()} }`;
    }
    get returnType(): PiClassifier {
        if (!!this.__returnType && !!this.__returnType.referred) {
            return this.__returnType.referred;
        }
        return null;
    }
    set returnType(cls: PiClassifier) {
        if (!!cls) {
            this.__returnType = PiElementReference.create<PiClassifier>(cls, "PiClassifier");
            // TODO owner of PiElementReference
            // this.__returnType.owner = this.language;
        }
    }
}
