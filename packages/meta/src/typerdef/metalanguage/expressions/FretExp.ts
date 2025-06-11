import { FreMetaClassifier, MetaElementReference, FreMetaLanguage } from "../../../languagedef/metalanguage/index.js";
import { FreTyperElement } from "../FreTyperElement.js";

export abstract class FretExp extends FreTyperElement {
    // @ts-ignore Property is set during parsing and checking phases
    language: FreMetaLanguage;
    // @ts-ignore Property is set during parsing and checking phases
    $returnType: MetaElementReference<FreMetaClassifier>;
    readonly $typename: string = "FretExp"; // holds the metatype in the form of a string
    // @ts-ignore Property is set during parsing and checking phases
    owner: FreTyperElement;

    toFreString(): string {
        return "SHOULD BE IMPLEMENTED BY SUBCLASSES OF 'FretExp'";
    }
    get returnType(): FreMetaClassifier | undefined {
        if (!!this.$returnType && !!this.$returnType.referred) {
            return this.$returnType.referred;
        }
        return undefined;
    }
    set returnType(cls: FreMetaClassifier | undefined) {
        if (!!cls) {
            this.$returnType = MetaElementReference.create<FreMetaClassifier>(cls);
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
