import { observable } from "mobx";
import { model } from "../../../language";
import { CoreTestExpression } from "./CoreTestExpression";

@model
export class CoreTestThisExpression extends CoreTestExpression {
    $typename: string = "CoreTestThisExpression";
    @observable name: string = "this";

    toString(): string {
        return this.name;
    }

    children(): CoreTestExpression[] {
        return [];
    }
}
