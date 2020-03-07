import { model } from "@projectit/core";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoOrExpression extends DemoBinaryExpression {
    $typename: string = "DemoOrExpression";

    get symbol(): string {
        return "or";
    }
}
