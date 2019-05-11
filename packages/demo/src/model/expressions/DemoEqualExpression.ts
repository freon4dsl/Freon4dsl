import { model } from "@projectit/model";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoEqualExpression extends DemoBinaryExpression {
  $type: string = "DemoEqualExpression";

  get symbol(): string {
    return "==";
  }
}
