import { FretExp } from "./FretExp";
import { FreClassifier, FreConcept } from "../../../languagedef/metalanguage";

export class FretAnytypeExp extends FretExp {
    static anyType: FreClassifier = new FreConcept();

    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretAnytypeExp>): FretAnytypeExp {
        const result: FretAnytypeExp = new FretAnytypeExp();
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }
    readonly $typename: string = "FretAnytypeExp"; // holds the metatype in the form of a string

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
