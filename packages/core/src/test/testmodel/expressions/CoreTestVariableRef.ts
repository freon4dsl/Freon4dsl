import { model, observablereference } from "../../../language";
import { CoreTestExpression } from "./CoreTestExpression";
import { CoreTestVariable } from "../domain/CoreTestVariable";
import { CoreTestAttribute } from "../domain/CoreTestAttribute";

// export class ACoreTestVariable {
//     constructor(public name: string) {}
// }
//
// export class ACoreTestAttribute {
//     constructor(public name: string) {}
// }

@model
export class CoreTestFunctionDeclaration {
    $typename: string = "CoreTestAbsExpression";
    constructor(public name: string) {}
}

@model
export class CoreTestVariableRefExpression extends CoreTestExpression {
    $typename: string = "CoreTestVariableRefExpression";
    referredName: string;
    attribute: string;

    @observablereference
    get refVariable(): CoreTestVariable {
        return this.model.functions[0].parameters.find(v => v.name === this.referredName);
    }

    @observablereference
    get refAttribute(): CoreTestAttribute {
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

    children(): CoreTestExpression[] {
        return [];
    }
}
