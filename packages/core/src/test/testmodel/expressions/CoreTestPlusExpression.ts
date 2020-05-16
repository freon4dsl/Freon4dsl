import { model } from "../../../language";
import { CoreTestBinaryExpression } from "./CoreTestBinaryExpression";

@model
export class CoreTestPlusExpression extends CoreTestBinaryExpression {
    $typename: string = "CoreTestPlusExpression";


    toString(): string {
        return "CoreTestPlusExpression";
    }
}
