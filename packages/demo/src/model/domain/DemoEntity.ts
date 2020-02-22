import { model, observablelistpart } from "@projectit/model";
import { observable } from "mobx";
import { DemoAttribute } from "./DemoAttribute";
import { DemoModelElement } from "../DemoModel";
import { DemoFunction } from "./DemoFunction";

@model
// tag::DemoEntity[]
export class DemoEntity extends DemoModelElement {
    @observable name: string;
    @observablelistpart attributes: DemoAttribute[];
// end::DemoEntity[]
    @observablelistpart functions: DemoFunction[];

    $type: string = "DemoEntity";

    constructor() {
        super();
    }

    toString(): string {
        return "entity " + this.name;
    }

    asString(): string {
        return this.toString();
    }

    static create(name: string): DemoEntity {
        const result = new DemoEntity();
        result.name = name;
        return result;
    }
}
