import { observable } from "mobx";
import { model } from "../../../language";

import { CoreTestAttributeType } from "./CoreTestAttributeType";
import { CoreTestModelElement } from "../CoreTestModel";

@model
// tag::CoreTestAttribute[]
export class CoreTestAttribute extends CoreTestModelElement {
    @observable name: string = "";
    @observable type: CoreTestAttributeType = CoreTestAttributeType.String;
// tag::CoreTestAttribute[]
    $typename: string = "CoreTestAttribute";

    constructor() {
        super();
    }

    toString(): string {
        return "attribute " + this.name + " : " + this.type;
    }

    asString(): string {
        return this.toString();
    }

    static create(name: string): CoreTestAttribute {
        const result = new CoreTestAttribute();
        result.name = name;
        return result;
    }
}
