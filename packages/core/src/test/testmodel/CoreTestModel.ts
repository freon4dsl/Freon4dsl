import { observable } from "mobx";
import { MobxModelElementImpl, model, observablelistpart } from "../../language";
import * as uuid from "uuid";

import { CoreTestEntity } from "./domain/CoreTestEntity";
import { CoreTestFunction } from "./domain/CoreTestFunction";

@model
export abstract class CoreTestModelElement extends MobxModelElementImpl {
    readonly $id: string;
    $typename: string;

    static currentElementId: number = 1;

    constructor() {
        super();
        this.$id = "projectit-core-test-" + CoreTestModelElement.currentElementId++; ///uuid.v4();
    }

    get model(): CoreTestModel | null {
        let con: any = this;
        while (con) {
            if (con instanceof CoreTestModel) {
                // console.log("get model projectit-demo model: " + con.unitName);
                return con;
            } else if (con instanceof CoreTestModelElement) {
                // console.log("get model up from: " + con.unitName + " to: " + con.container.toString());
                con = con.container;
            } else {
                // console.log("get model NULL: ");
                return null;
            }
        }
        return null;
    }

    abstract asString(): string;

    equals(other : CoreTestModelElement) : boolean {
        if (this.$id === other.$id ) {
            return true;
        }
        return false;
    }
}

@model
// tag::CoreTestModel[]
export class CoreTestModel extends CoreTestModelElement {
    @observable name: string;
    @observablelistpart entities: CoreTestEntity[];
    // end::CoreTestModel[]

    @observablelistpart functions: CoreTestFunction[];
    $typename: string = "CoreTestModel";

    constructor() {
        super();
    }

    toString(): string {
        return "model " + this.name;
    }

    asString(): string {
        return "model " + this.name;
    }

    static create(name: string): CoreTestModel {
        const result = new CoreTestModel();
        result.name = name;
        return result;
    }
// tag::CoreTestModel[]
}
// end::CoreTestModel[]
