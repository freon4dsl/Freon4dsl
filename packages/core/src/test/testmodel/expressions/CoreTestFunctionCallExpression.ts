import { observable } from "mobx";
import { model, observablelistpart } from "../../../language";

import { CoreTestExpression } from "./CoreTestExpression";
import { CoreTestFunction } from "../domain/CoreTestFunction";

@model
export class CoreTestFunctionCallExpression extends CoreTestExpression {
    $typename: string = "CoreTestFunctionCallExpression";
    @observablelistpart args: CoreTestExpression[];
    get functionName(): string {
        return this.functionDefinition ? this.functionDefinition.name : null;
    }
    @observable functionDefinition: CoreTestFunction | null;

    constructor() {
        super();
    }

    getName = (): string => {
        return this.functionName;
    };

    pushArg(exp: CoreTestExpression) {
        this.args.push(exp);
    }

    toString(): string {
        return this.functionName + "()";
    }

    children(): CoreTestExpression[] {
        return this.args;
    }
}
