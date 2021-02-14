import { model, observablepart } from "../../../language";
import { CoreTestExpression } from "./CoreTestExpression";

@model
export class CoreTestAbsExpression extends CoreTestExpression {
    $typename: string = "CoreTestAbsExpression";
    @observablepart expr: CoreTestExpression;

    toString(): string {
        return "abs(" + this.expr.toString() + ")";
    }

    children(): CoreTestExpression[] {
        return [this.expr];
    }
}
