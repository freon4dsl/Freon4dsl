import { FreClassifier, MetaElementReference, FreLanguage } from "../../../languagedef/metalanguage";
import { PiTyperElement } from "../PiTyperElement";

export abstract class PitExp extends PiTyperElement {
    language: FreLanguage;
    __returnType: MetaElementReference<FreClassifier>;
    readonly $typename: string = "PitExp"; // holds the metatype in the form of a string
    owner: PiTyperElement;

    toPiString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'PitExp'";
    }
    get returnType(): FreClassifier {
        if (!!this.__returnType && !!this.__returnType.referred) {
            return this.__returnType.referred;
        }
        return null;
    }
    set returnType(cls: FreClassifier) {
        if (!!cls) {
            this.__returnType = MetaElementReference.create<FreClassifier>(cls, "FreClassifier");
            this.__returnType.owner = this.language;
        }
    }

    baseSource(): PitExp {
        console.log("baseSource() SHOULD BE IMPLEMENTED BY SUBCLASS OF PitExp: " + this.constructor.name);
        return this;
    }

    get isList(): boolean {
        return false;
    }
}
