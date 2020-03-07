import { observable } from "mobx";
import { model } from "@projectit/core";
import { DemoExpression } from "./DemoExpression";

@model
export class DemoThisExpression extends DemoExpression {
    $typename: string = "DemoThisExpression";
    @observable name: string = "this";

    toString(): string {
        return this.name;
    }

    children(): DemoExpression[] {
        return [];
    }
}
