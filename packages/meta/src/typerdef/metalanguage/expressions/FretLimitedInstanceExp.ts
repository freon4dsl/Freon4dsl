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
        if (!!data.__myLimited) {
            result.__myLimited = data.__myLimited;
        }
        if (!!data.myInstance) {
            result.myInstance = data.myInstance;
        }
        if (!!data.__myInstance) {
            result.__myInstance = data.__myInstance;
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }
    readonly $typename: string = "FretLimitedInstanceExp"; // holds the metatype in the form of a string

    __myLimited?: MetaElementReference<FreLimitedConcept>;
    __myInstance: MetaElementReference<FreInstance>;
    toFreString(): string {
        let prefix: string = "";
        if (!!this.__myLimited) {
            prefix = this.__myLimited.name + ":"
        }
        return `${prefix}${this.__myInstance.name}`;
    }

    get myLimited(): FreLimitedConcept {
        if (!!this.__myLimited && !!this.__myLimited.referred) {
            return this.__myLimited.referred;
        }
        return null;
    }

    set myLimited(limitedConcept: FreLimitedConcept) {
        if (!!limitedConcept) {
            this.__myLimited = MetaElementReference.create<FreLimitedConcept>(limitedConcept, "FreLimitedConcept");
            this.__myLimited.owner = this.language;
        }
    }

    get myInstance(): FreInstance {
        if (!!this.__myInstance && !!this.__myInstance.referred) {
            return this.__myInstance.referred;
        }
        return null;
    }

    set myInstance(cls: FreInstance) {
        if (!!cls) {
            this.__myInstance = MetaElementReference.create<FreInstance>(cls, "FreInstance");
            this.__myInstance.owner = this.language;
        }
    }

    get type(): FreClassifier {
        return this.myLimited;
    }
}
