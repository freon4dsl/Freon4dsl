import { PiDefinitionElement } from "../../utils";
import { PiClassifier, PiElementReference } from "../../languagedef/metalanguage";

export abstract class PitClassifierRule extends PiDefinitionElement {
    __myClassifier: PiElementReference<PiClassifier>;
    get myClassifier(): PiClassifier {
        if (!!this.__myClassifier && !!this.__myClassifier.referred) {
            return this.__myClassifier.referred;
        }
        return null;
    }
    set myClassifier(cls: PiClassifier) {
        if (!!cls) {
            this.__myClassifier = PiElementReference.create<PiClassifier>(cls, "PiClassifier");
            // this.__myClassifier.owner = this.language;
        }
    }
    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PitClassifierRule'";
    }
}
