import { model, observablelistpart } from "../../../language";
import { observable } from "mobx";
import { CoreTestAttribute } from "./CoreTestAttribute";
import { CoreTestModelElement } from "../CoreTestModel";
import { CoreTestFunction } from "./CoreTestFunction";

@model
// tag::CoreTestEntity[]
export class CoreTestEntity extends CoreTestModelElement {
    @observable name: string;
    @observablelistpart attributes: CoreTestAttribute[];
// end::CoreTestEntity[]
    @observablelistpart functions: CoreTestFunction[];

    $typename: string = "CoreTestEntity";

    constructor() {
        super();
    }

    toString(): string {
        return "entity " + this.name;
    }

    asString(): string {
        return this.toString();
    }

    static create(name: string): CoreTestEntity {
        const result = new CoreTestEntity();
        result.name = name;
        return result;
    }
}
