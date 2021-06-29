import { observable } from "mobx";
import { model } from "../../../language";
import { CoreTestExpression } from "./CoreTestExpression";

@model
export class CoreTestThisExpression extends CoreTestExpression {
    $typename: string = "CoreTestThisExpression";

    // following line results in type error with TS version ^4.0.2
    // @observable name: string = "this";

    toString(): string {
        return this.name;
    }

    @observable get name(): string {
        return this.toString();
    }

    children(): CoreTestExpression[] {
        return [];
    }
}
