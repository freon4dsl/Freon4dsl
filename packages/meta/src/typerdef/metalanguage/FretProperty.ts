import { FreClassifier, FreConceptProperty, MetaElementReference, FreProperty } from "../../languagedef/metalanguage";
import { FretTypeConcept } from "./FretTypeConcept";

export class FretProperty extends FreConceptProperty {
    owner: FretTypeConcept;
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretProperty>): FretProperty {
        const result = new FretProperty();
        if (!!data.isPublic) {
            result.isPublic = data.isPublic;
        } else {
            result.isPublic = false;
        }
        if (!!data.isOptional) {
            result.isOptional = data.isOptional;
        } else {
            result.isOptional = false;
        }
        if (!!data.isList) {
            result.isList = data.isList;
        } else {
            result.isList = false;
        }
        if (!!data.isPart) {
            result.isPart = data.isPart;
        } else {
            result.isPart = true;
        }
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.location) {
            result.location = data.location;
        }
        if (!!data.typeReference) {
            result.typeReference = data.typeReference;
        }
        if (!!data.type) {
            result.type = data.type;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        // if (!!data.owningClassifier) {
        //     result.owningClassifier = data.owningClassifier;
        // }
        return result;
    }
    readonly $typename: string = "FretProperty"; // holds the metatype in the form of a string

    toFreString(): string {
        return this.name + ": " + this.typeReference.name;
    }
}
