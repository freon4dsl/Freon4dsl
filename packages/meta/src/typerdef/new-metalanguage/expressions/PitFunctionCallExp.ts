import { PitAppliedExp } from "./PitAppliedExp";
import { PiClassifier, PiElementReference } from "../../../languagedef/metalanguage";
import { PitExp } from "./PitExp";

export class PitFunctionCallExp extends PitAppliedExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitFunctionCallExp>): PitFunctionCallExp {
        const result = new PitFunctionCallExp();
        if (!!data.calledFunction) {
            result.calledFunction = data.calledFunction;
        }
        if (!!data.arguments) {
            data.arguments.forEach(x => result.arguments.push(x));
        }
        if (!!data.__returnType) {
            result.__returnType = data.__returnType;
        }
        if (!!data.returnType) {
            result.returnType = data.returnType;
        }
        return result;
    }
    calledFunction: string;
    __returnType?: PiElementReference<PiClassifier>;
    arguments: PitExp[] = [];
    toPiString(): string {
        return `${this.calledFunction}( ${this.arguments.map((arg => arg.toPiString())).join(", ")} )`;
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
            this.__returnType.owner = this.language;
        }
    }
    get type(): PiClassifier {
        return this.returnType;
    }
}
