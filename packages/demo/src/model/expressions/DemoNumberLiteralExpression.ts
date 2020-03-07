import { observable } from "mobx";
import { model } from "@projectit/core";
import { DemoLiteralExpression } from "./DemoLiteralExpression";

@model
export class DemoNumberLiteralExpression extends DemoLiteralExpression {
    $type: string = "DemoNumberLiteralExpression";
    @observable value: string = "0";

    constructor() {
        super();
    }

    toString(): string {
        return this.value;
    }

    static create(v: string) {
        const result = new DemoNumberLiteralExpression();
        result.value = v;
        return result;
    }
}
