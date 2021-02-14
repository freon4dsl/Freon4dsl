import { model, observablereference } from "../../../language";
import { CoreTestModelElement } from "../CoreTestModel";
import { CoreTestEntity } from "./CoreTestEntity";

@model
export class CoreTestVariable extends CoreTestModelElement {
    $typename: string = "CoreTestVariable";
    name: string = "";

    @observablereference
    type: CoreTestEntity;

    constructor() {
        super();
    }

    toString(): string {
        return "variable " + this.name;
    }

    asString(): string {
        return this.toString();
    }

    static create(name: string, type: CoreTestEntity): CoreTestVariable {
        const result = new CoreTestVariable();
        result.name = name;
        result.type = type;
        return result;
    }
}
