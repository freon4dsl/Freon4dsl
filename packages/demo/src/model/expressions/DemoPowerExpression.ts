import { model } from "@projectit/core";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoPowerExpression extends DemoBinaryExpression {
    $type: string = "DemoPowerExpression";

    get symbol(): string {
        return "^";
    }
}
