import { model, observablepart } from "../../../language";

import { CoreTestExpression } from "./CoreTestExpression";
import { CoreTestPlaceholderExpression } from "./CoreTestPlaceholderExpression";

@model
export class CoreTestIfExpression extends CoreTestExpression {
    $typename: string = "CoreTestIfExpression";
    @observablepart condition: CoreTestExpression;
    @observablepart thenExpression: CoreTestExpression;
    @observablepart elseExpression: CoreTestExpression;

    constructor() {
        super();
        this.condition = new CoreTestPlaceholderExpression();
        this.thenExpression = new CoreTestPlaceholderExpression();
        this.elseExpression = new CoreTestPlaceholderExpression();
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

    children(): CoreTestExpression[] {
        return [this.condition, this.thenExpression, this.elseExpression];
    }
}
