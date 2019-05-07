import { model } from "@projectit/model";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoMultiplyExpression extends DemoBinaryExpression {
    $type: string = "DemoMultiplyExpression";

    get symbol(): string {
        return "*";
    }
}
