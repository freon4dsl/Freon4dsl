import { FretExp } from "./FretExp";
import { FreClassifier, MetaElementReference, FreInstance, FreLimitedConcept } from "../../../languagedef/metalanguage";

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

    $myLimited?: MetaElementReference<FreLimitedConcept>;
    $myInstance: MetaElementReference<FreInstance>;
    toFreString(): string {
        let prefix: string = "";
        if (!!this.$myLimited) {
            prefix = this.$myLimited.name + ":";
        }
        return `${prefix}${this.$myInstance.name}`;
    }

    get myLimited(): FreLimitedConcept {
        if (!!this.$myLimited && !!this.$myLimited.referred) {
            return this.$myLimited.referred;
        }
        return null;
    }

    set myLimited(limitedConcept: FreLimitedConcept) {
        if (!!limitedConcept) {
            this.$myLimited = MetaElementReference.create<FreLimitedConcept>(limitedConcept, "FreLimitedConcept");
            this.$myLimited.owner = this.language;
        }
    }

    get myInstance(): FreInstance {
        if (!!this.$myInstance && !!this.$myInstance.referred) {
            return this.$myInstance.referred;
        }
        return null;
    }

    set myInstance(cls: FreInstance) {
        if (!!cls) {
            this.$myInstance = MetaElementReference.create<FreInstance>(cls, "FreInstance");
            this.$myInstance.owner = this.language;
        }
    }

    get type(): FreClassifier {
        return this.myLimited;
    }
}
