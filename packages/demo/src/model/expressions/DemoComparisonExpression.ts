import { model } from "@projectit/core";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoComparisonExpression extends DemoBinaryExpression {
    $typename: string = "DemoComparisonExpression";

    comparisonType: string

    constructor() {
        super();
    }

    static create(comparison: string): DemoComparisonExpression {
        const result = new DemoComparisonExpression();
        result.comparisonType = comparison;
        return result;
    }
}
