import { model } from "projectit-model";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoPlusExpression extends DemoBinaryExpression {
    $type: string = "DemoPlusExpression";

    get symbol(): string {
        return "+";
    }

    toString(): string {
        return "DemoPlusExpression";
    }

}
