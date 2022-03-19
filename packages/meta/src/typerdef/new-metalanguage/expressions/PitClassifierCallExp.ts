import { PitExp } from "./PitExp";
import { PiClassifier, PiElementReference } from "../../../languagedef/metalanguage";

export class PitClassifierCallExp extends PitExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitClassifierCallExp>): PitClassifierCallExp {
        const result = new PitClassifierCallExp();
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
    __myClassifier: PiElementReference<PiClassifier>;
    toPiString(): string {
        return `${this.__myClassifier.name}`;
    }

    get myClassifier(): PiClassifier {
        if (!!this.__myClassifier && !!this.__myClassifier.referred) {
            return this.__myClassifier.referred;
        }
        return null;
    }

    set myClassifier(classifier: PiClassifier) {
        if (!!classifier) {
            this.__myClassifier = PiElementReference.create<PiClassifier>(classifier, "PiClassifier");
            this.__myClassifier.owner = this.language;
        }
    }
    get returnType(): PiClassifier {
        return this.myClassifier;
    }
}
