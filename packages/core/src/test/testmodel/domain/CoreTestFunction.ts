import { observable } from "mobx";
import { model, observablelistpart, observablepart, observablereference } from "../../../language";

import { CoreTestModelElement } from "../CoreTestModel";
import { CoreTestExpression } from "../expressions/CoreTestExpression";
import { CoreTestVariable } from "./CoreTestVariable";
import { CoreTestAttributeType } from "./CoreTestAttributeType";

@model
export class CoreTestFunction extends CoreTestModelElement {
    $typename: string = "CoreTestFunction";
    @observable name: string;
    @observablepart expression: CoreTestExpression;
    @observablelistpart parameters: CoreTestVariable[];

    constructor() {
        super();
    }

    toString(): string {
        return "function " + this.name;
    }

    asString(): string {
        return this.toString();
    }

    static create(name: string): CoreTestFunction {
        const result = new CoreTestFunction();
        result.name = name;
        return result;
    }
}
