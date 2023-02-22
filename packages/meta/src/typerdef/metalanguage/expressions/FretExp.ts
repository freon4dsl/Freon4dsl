import { FreClassifier, MetaElementReference, FreLanguage } from "../../../languagedef/metalanguage";
import { FreTyperElement } from "../FreTyperElement";

export abstract class FretExp extends FreTyperElement {
    language: FreLanguage;
    $returnType: MetaElementReference<FreClassifier>;
    readonly $typename: string = "FretExp"; // holds the metatype in the form of a string
    owner: FreTyperElement;

    toFreString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'FretExp'";
    }
    get returnType(): FreClassifier {
        if (!!this.$returnType && !!this.$returnType.referred) {
            return this.$returnType.referred;
        }
        return null;
    }
    set returnType(cls: FreClassifier) {
        if (!!cls) {
            this.$returnType = MetaElementReference.create<FreClassifier>(cls, "FreClassifier");
            this.$returnType.owner = this.language;
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
