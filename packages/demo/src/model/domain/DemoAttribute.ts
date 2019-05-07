import { observable } from "mobx";
import { model } from "@projectit/model";

import { DemoAttributeType } from "./DemoAttributeType";
import { DemoModelElement } from "../DemoModel";

@model
export class DemoAttribute extends DemoModelElement {
    $type: string = "DemoAttribute";

    @observable name: string = "";
    @observable type: DemoAttributeType = "String";

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
