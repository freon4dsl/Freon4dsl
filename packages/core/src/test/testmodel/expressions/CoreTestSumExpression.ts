import { model, observablepart } from "../../../language";

import { CoreTestExpression } from "./CoreTestExpression";

@model
export class CoreTestSumExpression extends CoreTestExpression {
    $typename: string = "CoreTestSumExpression";
    @observablepart from: CoreTestExpression;
    @observablepart to: CoreTestExpression;
    @observablepart body: CoreTestExpression;

    constructor() {
        super();
    }

    toString(): string {
        return "SUM from " + (!!this.from ? this.from.toString() : "...") + " to " +
            (!!this.to ? this.to.toString() : "...") + " body " + (!!this.body ? this.body.toString() : "...") ;
    }

    children(): CoreTestExpression[] {
        return [this.from, this.to, this.body];
    }
}
