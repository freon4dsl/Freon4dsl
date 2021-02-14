import { model } from "../../../language";
import { CoreTestBinaryExpression } from "./CoreTestBinaryExpression";

@model
export class CoreTestEqualExpression extends CoreTestBinaryExpression {
    $typename: string = "CoreTestEqualExpression";

}
