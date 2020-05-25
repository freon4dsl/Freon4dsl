import { model, observablepart } from "../../../language";

import { CoreTestExpression } from "./CoreTestExpression";

@model
export class CoreTestIfExpression extends CoreTestExpression {
    $typename: string = "CoreTestIfExpression";
    @observablepart condition: CoreTestExpression;
    @observablepart thenExpression: CoreTestExpression;
    @observablepart elseExpression: CoreTestExpression;

    constructor() {
        super();
    }

    toString(): string {
        return (
            "IF " +
            (!!this.condition ? this.condition.toString() : "...") +
            " THEN " +
            (!!this.thenExpression ? this.thenExpression.toString() : "...") +
            " ELSE " +
            (!!this.elseExpression ? this.elseExpression.toString() : "...") +
            " ENDIF"
        );
    }

    children(): CoreTestExpression[] {
        return [this.condition, this.thenExpression, this.elseExpression];
    }
}
