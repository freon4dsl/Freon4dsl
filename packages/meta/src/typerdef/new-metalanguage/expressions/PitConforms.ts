import { PitStatement } from "./PitStatement";
import { PiClassifier, PiPrimitiveType } from "../../../languagedef/metalanguage";

export class PitConforms extends PitStatement {
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
    toPiString(): string {
        return `${this.left.toPiString()} conformsto ${this.right.toPiString()};`;
    }
    get type(): PiClassifier {
        return PiPrimitiveType.boolean;
    }
}
