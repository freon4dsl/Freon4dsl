import { model } from "@projectit/core";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoAndExpression extends DemoBinaryExpression {
    $typename: string = "DemoAndExpression";

    get symbol(): string {
        return "and";
    }
}
