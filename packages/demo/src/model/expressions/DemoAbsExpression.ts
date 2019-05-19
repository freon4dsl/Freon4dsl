import { model, observablepart } from "@projectit/model";
import { DemoExpression } from "./DemoExpression";

@model
export class DemoAbsExpression extends DemoExpression {
  $type: string = "DemoAbsExpression";
  @observablepart expr: DemoExpression;

  toString(): string {
    return "abs(" + this.expr.toString() + ")";
  }

  children(): DemoExpression[] {
    return [this.expr];
  }
}
