import { model, observablepart } from "@projectit/model";

import { DemoExpression } from "./DemoExpression";
import { DemoPlaceholderExpression } from "./DemoPlaceholderExpression";

@model
export class DemoIfExpression extends DemoExpression {
  $type: string = "DemoIfExpression";
  @observablepart condition: DemoExpression;
  @observablepart thenExpression: DemoExpression;
  @observablepart elseExpression: DemoExpression;

  constructor() {
    super();
    this.condition = new DemoPlaceholderExpression();
    this.thenExpression = new DemoPlaceholderExpression();
    this.elseExpression = new DemoPlaceholderExpression();
  }

  toString(): string {
    return (
      "IF " +
      this.condition.toString() +
      " THEN " +
      this.thenExpression.toString() +
      " ELSE " +
      this.elseExpression.toString() +
      " ENDIF"
    );
  }

  children(): DemoExpression[] {
    return [this.condition, this.thenExpression, this.elseExpression];
  }
}
