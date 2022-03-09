import { PitStatement } from "./PitStatement";
import { PiClassifier, PiPrimitiveType } from "../../../languagedef/metalanguage";

export class PitEquals extends PitStatement {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitEquals>): PitEquals {
        const result = new PitEquals();
        if (!!data.left) {
            result.left = data.left;
        }
        if (!!data.right) {
            result.right = data.right;
        }
        return result;
    }
    toPiString(): string {
        return `${this.left.toPiString()} equalsto ${this.right.toPiString()};`;
    }
    get type(): PiClassifier {
        return PiPrimitiveType.boolean;
    }
}
