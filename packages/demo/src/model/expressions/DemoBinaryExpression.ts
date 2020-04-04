import { observablepart } from "@projectit/core";

import { DemoExpression } from "./DemoExpression";
import { DemoPlaceholderExpression } from "./DemoPlaceholderExpression";
import { symbol } from "./DemoUtil";

export abstract class DemoBinaryExpression extends DemoExpression {
    @observablepart left: DemoExpression;
    @observablepart right: DemoExpression;

    constructor() {
        super();
        this.left = new DemoPlaceholderExpression();
        this.right = new DemoPlaceholderExpression();
    }

    children(): DemoExpression[] {
        return [this.left, this.right];
    }

    toString(): string {
        return "(" + this.left.toString() + " " + symbol(this) + " " + this.right.toString() + ")";
    }

    asString(): string {
        return "(" + this.left.asString() + " " + symbol(this) + " " + this.right.asString() + ")";
    }
}
