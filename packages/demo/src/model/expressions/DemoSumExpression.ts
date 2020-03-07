import { model, observablepart } from "@projectit/core";

import { DemoExpression } from "./DemoExpression";
import { DemoPlaceholderExpression } from "./DemoPlaceholderExpression";

@model
export class DemoSumExpression extends DemoExpression {
    $typename: string = "DemoSumExpression";
    @observablepart from: DemoExpression;
    @observablepart to: DemoExpression;
    @observablepart body: DemoExpression;

    constructor() {
        super();
        this.from = new DemoPlaceholderExpression();
        this.to = new DemoPlaceholderExpression();
        this.body = new DemoPlaceholderExpression();
    }

    toString(): string {
        return "SUM from " + this.from.toString() + " to " + this.to.toString() + " body " + this.body.toString();
    }

    children(): DemoExpression[] {
        return [this.from, this.to, this.body];
    }
}
