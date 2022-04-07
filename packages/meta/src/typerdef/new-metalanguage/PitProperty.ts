import { PiClassifier, PiElementReference, PiProperty } from "../../languagedef/metalanguage";

export class PitProperty extends PiProperty {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitProperty>): PitProperty {
        const result = new PitProperty();
        if (!!data.isPublic) {
            result.isPublic = data.isPublic;
        }
        if (!!data.isOptional) {
            result.isOptional = data.isOptional;
        }
        if (!!data.isList) {
            result.isList = data.isList;
        }
        if (!!data.isPart) {
            result.isPart = data.isPart;
        }
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.location) {
            result.location = data.location;
        }
        if (!!data.refType) {
            result.refType = data.refType;
        }
        if (!!data.type) {
            result.type = data.type;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        // if (!!data.owningConcept) {
        //     result.owningConcept = data.owningConcept;
        // }
        return result;
    }
    readonly $typename: string = "PitProperty"; // holds the metatype in the form of a string

    refType: PiElementReference<PiClassifier>;

    get type(): PiClassifier {
        return this.refType.referred;
    }

    set type(t: PiClassifier) {
        this.refType = PiElementReference.create<PiClassifier>(t, "PiClassifier");
    }
    toPiString(): string {
        return this.name + ": " + this.refType.name;
    }
}
