import { observable } from "mobx";
import { model } from "@projectit/core";

import { DemoAttributeType } from "./DemoAttributeType";
import { DemoModelElement } from "../DemoModel";

@model
// tag::DemoAttribute[]
export class DemoAttribute extends DemoModelElement {
    @observable name: string = "";
    @observable type: DemoAttributeType = DemoAttributeType.String;
// tag::DemoAttribute[]
    $typename: string = "DemoAttribute";

    constructor() {
        super();
    }

    toString(): string {
        return "attribute " + this.name + " : " + this.type;
    }

    asString(): string {
        return this.toString();
    }

    static create(name: string): DemoAttribute {
        const result = new DemoAttribute();
        result.name = name;
        return result;
    }
}
