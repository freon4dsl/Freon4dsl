import { model, observablepart } from "@projectit/core";
import { DemoExpression } from "./DemoExpression";

@model
export class DemoAbsExpression extends DemoExpression {
    $typename: string = "DemoAbsExpression";
    @observablepart expr: DemoExpression;

    toString(): string {
        return "abs(" + this.expr.toString() + ")";
    }

    children(): DemoExpression[] {
        return [this.expr];
    }
}
