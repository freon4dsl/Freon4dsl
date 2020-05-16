import * as uuid from "uuid";

import { CoreTestModelElement } from "../CoreTestModel";

export abstract class CoreTestExpression extends CoreTestModelElement {
    $typename: string;

    constructor() {
        super();
    }

    toString(): string {
        return "CoreTestExpression";
    }

    children(): CoreTestExpression[] | null {
        return [];
    }

    get name(): string {
        return this.toString();
    }

    identity(): string {
        console.log("Id is " + this.$id);
        return this.$id;
    }

    asString(): string {
        return this.toString();
    }
}
