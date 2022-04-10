import { PiClassifier, PiElementReference, PiLanguage } from "../../../languagedef/metalanguage";
import { PiTyperElement } from "../PiTyperElement";

export abstract class PitExp extends PiTyperElement {
    language: PiLanguage;
    __returnType: PiElementReference<PiClassifier>;
    readonly $typename: string = "PitExp"; // holds the metatype in the form of a string
    owner: PiTyperElement;

    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PitExp'";
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

    baseSource(): PitExp {
        console.log("baseSource() SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PitExp'");
        return null;
    }

    get isList(): boolean {
        return false;
    }
}
