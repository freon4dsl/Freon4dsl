import { PitExp } from "./PitExp";
import { PiClassifier, PiConcept } from "../../../languagedef/metalanguage";

export class PitAnytypeExp extends PitExp {
    static anyType: PiClassifier = new PiConcept();
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
    get type(): PiClassifier {
        return PitAnytypeExp.anyType;
    }
}
