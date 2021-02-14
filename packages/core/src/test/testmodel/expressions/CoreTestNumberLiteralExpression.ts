import { observable } from "mobx";
import { model } from "../../../language";
import { CoreTestLiteralExpression } from "./CoreTestLiteralExpression";

@model
export class CoreTestNumberLiteralExpression extends CoreTestLiteralExpression {
    $typename: string = "CoreTestNumberLiteralExpression";
    @observable value: string = "0";

    constructor() {
        super();
    }

    toString(): string {
        return this.value;
    }

    static create(v: string) {
        const result = new CoreTestNumberLiteralExpression();
        result.value = v;
        return result;
    }
}
