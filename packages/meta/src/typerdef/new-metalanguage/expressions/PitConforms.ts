import { PiClassifier, PiPrimitiveType } from "../../../languagedef/metalanguage";
import { PitBinaryExp } from "./PitBinaryExp";

export class PitConforms extends PitBinaryExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitConforms>): PitConforms {
        const result = new PitConforms();
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
    readonly $typename: string = "PitConforms"; // holds the metatype in the form of a string

    toPiString(): string {
        return `${this.left.toPiString()} conformsto ${this.right.toPiString()}`;
    }
    get type(): PiClassifier {
        return PiPrimitiveType.boolean;
    }
}
