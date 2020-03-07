import { model } from "@projectit/core";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoComparisonExpression extends DemoBinaryExpression {
    $type: string = "DemoComparisonExpression";
    symbol: string = ">";

    constructor() {
        super();
    }

    static create(symbol: string): DemoComparisonExpression {
        const result = new DemoComparisonExpression();
        result.symbol = symbol;
        return result;
    }
}
