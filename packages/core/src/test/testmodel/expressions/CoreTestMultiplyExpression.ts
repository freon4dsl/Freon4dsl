import { model } from "../../../language";
import { CoreTestBinaryExpression } from "./CoreTestBinaryExpression";

@model
export class CoreTestMultiplyExpression extends CoreTestBinaryExpression {
    $typename: string = "CoreTestMultiplyExpression";

}
