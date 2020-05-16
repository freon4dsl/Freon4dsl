import { model } from "../../../language";
import { CoreTestBinaryExpression } from "./CoreTestBinaryExpression";

@model
export class CoreTestAndExpression extends CoreTestBinaryExpression {
    $typename: string = "CoreTestAndExpression";

}
