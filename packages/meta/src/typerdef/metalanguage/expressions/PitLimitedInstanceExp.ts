import { PitExp } from "./PitExp";
import { PiClassifier, MetaElementReference, PiInstance, PiLimitedConcept } from "../../../languagedef/metalanguage";

export class PitLimitedInstanceExp extends PitExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitLimitedInstanceExp>): PitLimitedInstanceExp {
        const result = new PitLimitedInstanceExp();
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
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    readonly $typename: string = "PitLimitedInstanceExp"; // holds the metatype in the form of a string

    __myLimited?: MetaElementReference<PiLimitedConcept>;
    __myInstance: MetaElementReference<PiInstance>;
    toPiString(): string {
        let prefix: string = "";
        if (!!this.__myLimited) {
            prefix = this.__myLimited.name + ":"
        }
        return `${prefix}${this.__myInstance.name}`;
    }

    get myLimited(): PiLimitedConcept {
        if (!!this.__myLimited && !!this.__myLimited.referred) {
            return this.__myLimited.referred;
        }
        return null;
    }

    set myLimited(limitedConcept: PiLimitedConcept) {
        if (!!limitedConcept) {
            this.__myLimited = MetaElementReference.create<PiLimitedConcept>(limitedConcept, "PiLimitedConcept");
            this.__myLimited.owner = this.language;
        }
    }

    get myInstance(): PiInstance {
        if (!!this.__myInstance && !!this.__myInstance.referred) {
            return this.__myInstance.referred;
        }
        return null;
    }
    set myInstance(cls: PiInstance) {
        if (!!cls) {
            this.__myInstance = MetaElementReference.create<PiInstance>(cls, "PiInstance");
            this.__myInstance.owner = this.language;
        }
    }
    get type(): PiClassifier {
        return this.myLimited;
    }
    // baseSource(): PitExp {
    //     return this;
    // }

}
