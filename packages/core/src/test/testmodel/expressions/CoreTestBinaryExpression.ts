import { observablepart } from "../../../language";

import { CoreTestExpression } from "./CoreTestExpression";
import { symbol } from "./CoreTestUtil";

export abstract class CoreTestBinaryExpression extends CoreTestExpression {
    @observablepart left: CoreTestExpression;
    @observablepart right: CoreTestExpression;

    constructor() {
        super();
    }

    children(): CoreTestExpression[] {
        return [this.left, this.right];
    }

    toString(): string {
        return "(" + (!!this.left ? this.left.toString() : "...") + " " + symbol(this) + " " + (!!this.right ? this.right.toString() : "...") + ")";
    }

    asString(): string {
        return "(" + (!!this.left ? this.left.asString() : "...") + " " + symbol(this) + " " + (!!this.right ? this.right.asString() : "...") + ")";
    }
}
