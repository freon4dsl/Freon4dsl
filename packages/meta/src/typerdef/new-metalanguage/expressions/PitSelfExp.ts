import { PitExp } from "./PitExp";
import { PiClassifier } from "../../../languagedef/metalanguage";

export class PitSelfExp extends PitExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitSelfExp>): PitSelfExp {
        return new PitSelfExp();
    }
    _myType: PiClassifier;
    toPiString(): string {
        return `self`;
    }
    get type(): PiClassifier {
        return this._myType;
    }
    set type(cls: PiClassifier) {
        this._myType = cls;
    }
}
