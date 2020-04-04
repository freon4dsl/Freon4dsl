import { model } from "@projectit/core";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoPlusExpression extends DemoBinaryExpression {
    $typename: string = "DemoPlusExpression";


    toString(): string {
        return "DemoPlusExpression";
    }
}
