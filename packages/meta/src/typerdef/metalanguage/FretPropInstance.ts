// Generated by the Freon Language Generator.

import { FretCreateExp, FretExp } from "./expressions";
import { MetaElementReference, FreMetaProperty } from "../../languagedef/metalanguage";
import { FreTyperElement } from "./FreTyperElement";

/**
 * Class FretPropInstance is the implementation of the concept with the same name in the language definition file.
 */
export class FretPropInstance extends FreTyperElement {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretPropInstance>): FretPropInstance {
        const result = new FretPropInstance();
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.value) {
            result.value = data.value;
        }
        if (!!data.location) {
            result.location = data.location;
        }
        if (!!data.$property) {
            result.$property = data.$property;
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }
    owner: FretCreateExp;

    readonly $typename: string = "FretPropInstance"; // holds the metatype in the form of a string
    value: FretExp; // implementation of part 'value'
    $property: MetaElementReference<FreMetaProperty>; // implementation of reference 'property'

    /**
     * Convenience method for reference 'property'.
     * Instead of returning a 'MetaElementReference<FreProperty>' object,
     * it returns the referred 'FreProperty' object, if it can be found.
     */
    get property(): FreMetaProperty {
        if (!!this.$property) {
            return this.$property.referred;
        }
        return null;
    }
    toFreString(): string {
        return this.$property.name + " : " + this.value.toFreString();
    }
}
