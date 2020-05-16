import { model, observablepart } from "../../../language";

import { CoreTestExpression } from "./CoreTestExpression";
import { CoreTestPlaceholderExpression } from "./CoreTestPlaceholderExpression";

@model
export class CoreTestSumExpression extends CoreTestExpression {
    $typename: string = "CoreTestSumExpression";
    @observablepart from: CoreTestExpression;
    @observablepart to: CoreTestExpression;
    @observablepart body: CoreTestExpression;

    constructor() {
        super();
        this.from = new CoreTestPlaceholderExpression();
        this.to = new CoreTestPlaceholderExpression();
        this.body = new CoreTestPlaceholderExpression();
    }

    toString(): string {
        return "SUM from " + this.from.toString() + " to " + this.to.toString() + " body " + this.body.toString();
    }

    children(): CoreTestExpression[] {
        return [this.from, this.to, this.body];
    }
}
