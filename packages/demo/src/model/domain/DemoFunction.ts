import { observable } from "mobx";
import { model, observablelistpart, observablepart } from "@projectit/model";

import { DemoModelElement } from "../DemoModel";
import { DemoExpression } from "../expressions/DemoExpression";
import { DemoVariable } from "./DemoVariable";
import { DemoType } from "@projectit/demo/typeIt/DemoTypeChecker";
import { DemoAttributeType } from "./DemoAttributeType";

@model
export class DemoFunction extends DemoModelElement {
    $type: string = "DemoFunction";
    @observable name: string;
    @observablepart expression: DemoExpression;
    @observablelistpart parameters: DemoVariable[];
    @observable type: DemoType = DemoAttributeType.Any;

    constructor() {
        super();
    }

    toString(): string {
        return "function " + this.name;
    }

    asString(): string {
        return this.toString();
    }

    static create(name: string, type: DemoType): DemoFunction {
        const result = new DemoFunction();
        result.name = name;
        result.type = type;
        return result;
    }
}
