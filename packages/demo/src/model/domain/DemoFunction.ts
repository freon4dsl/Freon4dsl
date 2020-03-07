import { observable } from "mobx";
import { model, observablelistpart, observablepart, observablereference } from "@projectit/core";

import { DemoModelElement } from "../DemoModel";
import { DemoExpression } from "../expressions/DemoExpression";
import { DemoVariable } from "./DemoVariable";
import { DemoAttributeType } from "./DemoAttributeType";

@model
export class DemoFunction extends DemoModelElement {
    $type: string = "DemoFunction";
    @observable name: string;
    @observablepart expression: DemoExpression;
    @observablelistpart parameters: DemoVariable[];

    constructor() {
        super();
    }

    toString(): string {
        return "function " + this.name;
    }

    asString(): string {
        return this.toString();
    }

    static create(name: string): DemoFunction {
        const result = new DemoFunction();
        result.name = name;
        return result;
    }
}
