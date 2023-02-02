import { FreClassifier, MetaElementReference, FreLanguage } from "../../../languagedef/metalanguage";
import { FreTyperElement } from "../FreTyperElement";

export abstract class FretExp extends FreTyperElement {
    language: FreLanguage;
    __returnType: MetaElementReference<FreClassifier>;
    readonly $typename: string = "FretExp"; // holds the metatype in the form of a string
    owner: FreTyperElement;

    toFreString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'FretExp'";
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

    baseSource(): FretExp {
        console.log("baseSource() SHOULD BE IMPLEMENTED BY SUBCLASS OF FretExp: " + this.constructor.name);
        return this;
    }

    get isList(): boolean {
        return false;
    }
}
