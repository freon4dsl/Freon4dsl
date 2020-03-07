import { model } from "@projectit/core";
import { DemoExpression } from "./DemoExpression";

@model
export class DemoPlaceholderExpression extends DemoExpression {
    $type: string = "DemoPlaceholderExpression";

    toString(): string {
        return "...";
    }

    children(): DemoExpression[] {
        return [];
    }
}
