import { model } from "../../../language";
import { CoreTestBinaryExpression } from "./CoreTestBinaryExpression";

@model
export class CoreTestBinaryExpressionPlaceHolder extends CoreTestBinaryExpression {
    $typename: string = "CoreTestBinaryExpressionPlaceholder";

    asString(): string {
        return "...";
    }
}
