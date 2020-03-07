import { model, observablereference } from "@projectit/core";
import { DemoExpression } from "./DemoExpression";
import { DemoVariable } from "../domain/DemoVariable";
import { DemoAttribute } from "../domain/DemoAttribute";

// export class ADemoVariable {
//     constructor(public name: string) {}
// }
//
// export class ADemoAttribute {
//     constructor(public name: string) {}
// }

@model
export class DemoFunctionDeclaration {
    $type: string = "DemoAbsExpression";
    constructor(public name: string) {}
}

@model
export class DemoVariableRefExpression extends DemoExpression {
    $type: string = "DemoVariableRefExpression";
    referredName: string;
    attribute: string;

    @observablereference
    get refVariable(): DemoVariable {
        return this.model.functions[0].parameters.find(v => v.name === this.referredName);
    }

    @observablereference
    get refAttribute(): DemoAttribute {
        const refVar = this.refVariable;
        return refVar ? refVar.type.attributes.find(a => a.name === this.attribute) : null;
    }

    constructor() {
        super();
        this.getName = this.getName.bind(this);
    }

    getName() {
        return this.referredName;
    }

    toString(): string {
        return "$" + this.referredName;
    }

    children(): DemoExpression[] {
        return [];
    }
}
