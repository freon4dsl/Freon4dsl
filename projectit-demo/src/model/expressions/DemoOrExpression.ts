import { model } from "projectit-model";
import { DemoBinaryExpression } from "./DemoBinaryExpression";

@model
export class DemoOrExpression extends DemoBinaryExpression {
    $type: string = "DemoOrExpression";

    get symbol(): string {
        return "or";
    }
}
