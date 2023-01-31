import { PitExp } from "./PitExp";
import { FreClassifier, FreConcept } from "../../../languagedef/metalanguage";

export class PitAnytypeExp extends PitExp {
    static anyType: FreClassifier = new FreConcept();
    readonly $typename: string = "PitAnytypeExp"; // holds the metatype in the form of a string

    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitAnytypeExp>): PitAnytypeExp {
        const result: PitAnytypeExp = new PitAnytypeExp();
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }

    constructor() {
        super();
        PitAnytypeExp.anyType.name = "anytype";
    }

    toPiString(): string {
        return `anytype`;
    }

    get type(): FreClassifier {
        return PitAnytypeExp.anyType;
    }

    // baseSource(): PitExp {
    //     return this;
    // }
}
