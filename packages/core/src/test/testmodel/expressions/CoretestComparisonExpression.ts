import { model } from "../../../language";
import { CoreTestBinaryExpression } from "./CoreTestBinaryExpression";

@model
export class CoretestComparisonExpression extends CoreTestBinaryExpression {
    $typename: string = "CoreTestComparisonExpression";

    comparisonType: string

    constructor() {
        super();
    }

    static create(comparison: string): CoretestComparisonExpression {
        const result = new CoretestComparisonExpression();
        result.comparisonType = comparison;
        return result;
    }
}
