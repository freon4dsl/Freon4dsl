import { observable } from "mobx";
import { MobxModelElementImpl, model, observablelistpart } from "@projectit/model";
import * as uuid from "uuid";

import { DemoEntity } from "./domain/DemoEntity";
import { DemoFunction } from "./domain/DemoFunction";

@model
export abstract class DemoModelElement extends MobxModelElementImpl {
    readonly $id: string;
    $type: string;

    static currentElementId: number = 1;

    constructor() {
        super();
        this.$id = "projectit-demo-" + DemoModelElement.currentElementId++; ///uuid.v4();
    }

    get model(): DemoModel | null {
        let con: any = this;
        while (con) {
            if (con instanceof DemoModel) {
                // console.log("get model projectit-demo model: " + con.name);
                return con;
            } else if (con instanceof DemoModelElement) {
                // console.log("get model up from: " + con.name + " to: " + con.container.toString());
                con = con.container;
            } else {
                // console.log("get model NULL: ");
                return null;
            }
        }
        return null;
    }

    abstract asString(): string;

    equals(other : DemoModelElement) : boolean {
        if (this.$id === other.$id ) {
            return true;
        }
        return false;
    }
}

@model
// tag::DemoModel[]
export class DemoModel extends DemoModelElement {
    @observable name: string;
    @observablelistpart entities: DemoEntity[];
    // end::DemoModel[]

    @observablelistpart functions: DemoFunction[];
    $type: string = "DemoModel";

    constructor() {
        super();
    }

    toString(): string {
        return "model " + this.name;
    }

    asString(): string {
        return "model " + this.name;
    }

    static create(name: string): DemoModel {
        const result = new DemoModel();
        result.name = name;
        return result;
    }
// tag::DemoModel[]
}
// end::DemoModel[]
