import { observablepart } from "@projectit/model";

import { DemoExpression } from "./DemoExpression";
import { DemoPlaceholderExpression } from "./DemoPlaceholderExpression";

export abstract class DemoBinaryExpression extends DemoExpression {
    @observablepart left: DemoExpression;
    @observablepart right: DemoExpression;

    abstract symbol: string;

    constructor() {
        super();
        this.left = new DemoPlaceholderExpression();
        this.right = new DemoPlaceholderExpression();
    }

    children(): DemoExpression[] {
        return [this.left, this.right];
    }

    toString(): string {
        return "(" + this.left.toString() + " " + this.symbol + " " + this.right.toString() + ")";
    }

    asString(): string {
        return "(" + this.left.asString() + " " + this.symbol + " " + this.right.asString() + ")";
    }
}
