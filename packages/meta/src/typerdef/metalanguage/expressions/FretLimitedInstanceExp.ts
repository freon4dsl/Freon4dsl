import { FretExp } from "./FretExp";
import { FreMetaClassifier, MetaElementReference, FreMetaInstance, FreMetaLimitedConcept } from "../../../languagedef/metalanguage";

export class FretLimitedInstanceExp extends FretExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretLimitedInstanceExp>): FretLimitedInstanceExp {
        const result = new FretLimitedInstanceExp();
        if (!!data.myLimited) {
            result.myLimited = data.myLimited;
        }
        if (!!data.$myLimited) {
            result.$myLimited = data.$myLimited;
        }
        if (!!data.myInstance) {
            result.myInstance = data.myInstance;
        }
        if (!!data.$myInstance) {
            result.$myInstance = data.$myInstance;
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }
    readonly $typename: string = "FretLimitedInstanceExp"; // holds the metatype in the form of a string

    $myLimited?: MetaElementReference<FreMetaLimitedConcept>;
    $myInstance: MetaElementReference<FreMetaInstance>;
    toFreString(): string {
        let prefix: string = "";
        if (!!this.$myLimited) {
            prefix = this.$myLimited.name + ":";
        }
        return `${prefix}${this.$myInstance.name}`;
    }

    get myLimited(): FreMetaLimitedConcept {
        if (!!this.$myLimited && !!this.$myLimited.referred) {
            return this.$myLimited.referred;
        }
        return null;
    }

    set myLimited(limitedConcept: FreMetaLimitedConcept) {
        if (!!limitedConcept) {
            this.$myLimited = MetaElementReference.create<FreMetaLimitedConcept>(limitedConcept, "FreLimitedConcept");
            this.$myLimited.owner = this.language;
        }
    }

    get myInstance(): FreMetaInstance {
        if (!!this.$myInstance && !!this.$myInstance.referred) {
            return this.$myInstance.referred;
        }
        return null;
    }

    set myInstance(cls: FreMetaInstance) {
        if (!!cls) {
            this.$myInstance = MetaElementReference.create<FreMetaInstance>(cls, "FreInstance");
            this.$myInstance.owner = this.language;
        }
    }

    get type(): FreMetaClassifier {
        return this.myLimited;
    }
}
