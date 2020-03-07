import { model } from "@projectit/core";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoDivideExpression extends DemoBinaryExpression {
    $typename: string = "DemoDivideExpression";

    get symbol(): string {
        return "/";
    }
}
