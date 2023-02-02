import { FreClassifier, FrePrimitiveType } from "../../../languagedef/metalanguage";
import { FretBinaryExp } from "./FretBinaryExp";

export class FretEqualsExp extends FretBinaryExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretEqualsExp>): FretEqualsExp {
        const result = new FretEqualsExp();
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
    readonly $typename: string = "FretEquals"; // holds the metatype in the form of a string

    toFreString(): string {
        return `${this.left.toFreString()} equalsto ${this.right.toFreString()};`;
    }
    get type(): FreClassifier {
        return FrePrimitiveType.boolean;
    }
}
