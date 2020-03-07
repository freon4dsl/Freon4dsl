import { model } from "@projectit/core";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoBinaryExpressionPlaceholder extends DemoBinaryExpression {
    $typename: string = "DemoBinaryExpressionPlaceholder";

    get symbol(): string {
        return "#";
    }

    asString(): string {
        return "...";
    }
}
