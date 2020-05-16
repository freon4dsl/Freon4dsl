import { observablepart } from "../../../language";

import { CoreTestExpression } from "./CoreTestExpression";
import { CoreTestPlaceholderExpression } from "./CoreTestPlaceholderExpression";
import { symbol } from "./CoreTestUtil";

export abstract class CoreTestBinaryExpression extends CoreTestExpression {
    @observablepart left: CoreTestExpression;
    @observablepart right: CoreTestExpression;

    constructor() {
        super();
        this.left = new CoreTestPlaceholderExpression();
        this.right = new CoreTestPlaceholderExpression();
    }

    children(): CoreTestExpression[] {
        return [this.left, this.right];
    }

    toString(): string {
        return "(" + this.left.toString() + " " + symbol(this) + " " + this.right.toString() + ")";
    }

    asString(): string {
        return "(" + this.left.asString() + " " + symbol(this) + " " + this.right.asString() + ")";
    }
}
