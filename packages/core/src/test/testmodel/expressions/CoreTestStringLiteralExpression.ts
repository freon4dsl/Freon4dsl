import { observable } from "mobx";
import { model } from "../../../language";
import { CoreTestLiteralExpression } from "./CoreTestLiteralExpression";

@model
export class CoreTestStringLiteralExpression extends CoreTestLiteralExpression {
    $typename: string = "CoreTestStringLiteralExpression";
    @observable public value: string = "";

    constructor() {
        super();
    }

    toString(): string {
        return this.asString();
    }

    asString(): string {
        return '"' + this.value + '"';
    }

    static create(value: string): CoreTestStringLiteralExpression {
        const result = new CoreTestStringLiteralExpression();
        result.value = value;
        return result;
    }
}
