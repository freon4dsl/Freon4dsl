import { model } from "../../../language";
import { CoreTestBinaryExpression } from "./CoreTestBinaryExpression";

@model
export class CoreTestOrExpression extends CoreTestBinaryExpression {
    $typename: string = "CoreTestOrExpression";

}
