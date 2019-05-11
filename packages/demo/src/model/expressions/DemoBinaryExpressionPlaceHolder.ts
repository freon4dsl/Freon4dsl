import { model } from "@projectit/model";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoBinaryExpressionPlaceholder extends DemoBinaryExpression {
  $type: string = "DemoBinaryExpressionPlaceholder";

  get symbol(): string {
    return "#";
  }

  asString(): string {
    return "...";
  }
}
