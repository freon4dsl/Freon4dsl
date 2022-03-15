import { PitExp } from "./PitExp";
import { PiClassifier, PiElementReference } from "../../../languagedef/metalanguage";

export class PitSelfExp extends PitExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitSelfExp>): PitSelfExp {
        const result: PitSelfExp = new PitSelfExp();
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    toPiString(): string {
        return `self`;
    }
    baseSource(): PitExp {
        return this;
    }

}
