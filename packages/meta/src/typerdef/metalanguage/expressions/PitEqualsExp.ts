import { PiClassifier, PiPrimitiveType } from "../../../languagedef/metalanguage";
import { PitBinaryExp } from "./PitBinaryExp";

export class PitEqualsExp extends PitBinaryExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitEqualsExp>): PitEqualsExp {
        const result = new PitEqualsExp();
        if (!!data.left) {
            result.left = data.left;
        }
        if (!!data.right) {
            result.right = data.right;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }
    readonly $typename: string = "PitEquals"; // holds the metatype in the form of a string

    toPiString(): string {
        return `${this.left.toPiString()} equalsto ${this.right.toPiString()};`;
    }
    get type(): PiClassifier {
        return PiPrimitiveType.boolean;
    }
}
