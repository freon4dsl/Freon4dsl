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
        return new PitAnytypeExp();
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
