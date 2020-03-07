import { model } from "@projectit/core";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoEqualExpression extends DemoBinaryExpression {
    $type: string = "DemoEqualExpression";

    get symbol(): string {
        return "==";
    }
}
