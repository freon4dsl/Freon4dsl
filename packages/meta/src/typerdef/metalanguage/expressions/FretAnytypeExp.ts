import { FretExp } from "./FretExp";
import { FreClassifier, FreConcept } from "../../../languagedef/metalanguage";

export class FretAnytypeExp extends FretExp {
    static anyType: FreClassifier = new FreConcept();
    readonly $typename: string = "FretAnytypeExp"; // holds the metatype in the form of a string

    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretAnytypeExp>): FretAnytypeExp {
        const result: FretAnytypeExp = new FretAnytypeExp();
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }

    constructor() {
        super();
        FretAnytypeExp.anyType.name = "anytype";
    }

    toFreString(): string {
        return `anytype`;
    }

    get type(): FreClassifier {
        return FretAnytypeExp.anyType;
    }

    // baseSource(): FretExp {
    //     return this;
    // }
}
