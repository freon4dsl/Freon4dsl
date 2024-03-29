import { FreMetaClassifier, MetaElementReference, FreMetaLanguage } from "../../../languagedef/metalanguage";
import { FreTyperElement } from "../FreTyperElement";

export abstract class FretExp extends FreTyperElement {
    language: FreMetaLanguage;
    $returnType: MetaElementReference<FreMetaClassifier>;
    readonly $typename: string = "FretExp"; // holds the metatype in the form of a string
    owner: FreTyperElement;

    toFreString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'FretExp'";
    }
    get returnType(): FreMetaClassifier {
        if (!!this.$returnType && !!this.$returnType.referred) {
            return this.$returnType.referred;
        }
        return null;
    }
    set returnType(cls: FreMetaClassifier) {
        if (!!cls) {
            this.$returnType = MetaElementReference.create<FreMetaClassifier>(cls, "FreClassifier");
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
