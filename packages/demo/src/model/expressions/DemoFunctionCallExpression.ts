import { observable } from "mobx";
import { model, observablelistpart } from "@projectit/core";

import { DemoExpression } from "./DemoExpression";
import { DemoFunction } from "../domain/DemoFunction";

@model
export class DemoFunctionCallExpression extends DemoExpression {
    $type: string = "DemoFunctionCallExpression";
    @observablelistpart args: DemoExpression[];
    get functionName(): string {
        return this.functionDefinition ? this.functionDefinition.name : null;
    }
    @observable functionDefinition: DemoFunction | null;

    constructor() {
        super();
    }

    getName = (): string => {
        return this.functionName;
    };

    pushArg(exp: DemoExpression) {
        this.args.push(exp);
    }

    toString(): string {
        return this.functionName + "()";
    }

    children(): DemoExpression[] {
        return this.args;
    }
}
