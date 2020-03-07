import { model } from "@projectit/core";
import { DemoExpression } from "./DemoExpression";

@model
export class DemoPlaceholderExpression extends DemoExpression {
    $typename: string = "DemoPlaceholderExpression";

    toString(): string {
        return "...";
    }

    children(): DemoExpression[] {
        return [];
    }
}
