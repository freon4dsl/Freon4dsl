// Generated by the Freon Language Generator.

import { FretCreateExp, FretExp } from "./expressions";
import { MetaElementReference, FreProperty } from "../../languagedef/metalanguage";
import { FreTyperElement } from "./FreTyperElement";

/**
 * Class FretPropInstance is the implementation of the concept with the same name in the language definition file.
 */
export class FretPropInstance extends FreTyperElement {
    owner: FretCreateExp;
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
        if (!!data.__property) {
            result.__property = data.__property;
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }

    readonly $typename: string = "FretPropInstance"; // holds the metatype in the form of a string
    name: string = ""; // implementation of name
    value: FretExp; // implementation of part 'value'
    __property: MetaElementReference<FreProperty>; // implementation of reference 'property'

    /**
     * Convenience method for reference 'property'.
     * Instead of returning a 'MetaElementReference<FreProperty>' object,
     * it returns the referred 'FreProperty' object, if it can be found.
     */
    get property(): FreProperty {
        if (!!this.__property) {
            return this.__property.referred;
        }
        return null;
    }
    toFreString(): string {
        return this.__property.name + " : " +this.value.toFreString();
    }
}
