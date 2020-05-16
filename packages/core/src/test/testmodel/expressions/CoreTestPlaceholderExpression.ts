import { model } from "../../../language";
import { CoreTestExpression } from "./CoreTestExpression";

@model
export class CoreTestPlaceholderExpression extends CoreTestExpression {
    $typename: string = "CoreTestPlaceholderExpression";

    toString(): string {
        return "...";
    }

    children(): CoreTestExpression[] {
        return [];
    }
}
