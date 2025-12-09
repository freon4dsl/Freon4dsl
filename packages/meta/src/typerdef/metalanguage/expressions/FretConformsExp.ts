import type { FreMetaClassifier} from "../../../languagedef/metalanguage/index.js";
import { FreMetaPrimitiveType } from "../../../languagedef/metalanguage/index.js";
import { FretBinaryExp } from "./FretBinaryExp.js";

export class FretConformsExp extends FretBinaryExp {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<FretConformsExp>): FretConformsExp {
        const result = new FretConformsExp();
        if (!!data.left) {
            result.left = data.left;
        }
        if (!!data.right) {
            result.right = data.right;
        }
        if (data.aglParseLocation) {
            result.aglParseLocation = data.aglParseLocation;
        }
        return result;
    }
    readonly $typename: string = "FretConforms"; // holds the metatype in the form of a string

    toFreString(): string {
        return `${this.left.toFreString()} conformsto ${this.right.toFreString()}`;
    }
    get type(): FreMetaClassifier {
        return FreMetaPrimitiveType.boolean;
    }
}
