import { model } from "projectit-model";
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
