import "reflect-metadata";
import { observablelistpart, observablepart } from "../../src/MobxModelDecorators";
import { DecoratedModelElement } from "../../src/DecoratedModelElement";
import { observable } from "mobx";

export class Expression implements DecoratedModelElement {
    container: DecoratedModelElement;
    propertyName: string;
    propertyIndex: number;
    @observable public name: string;

    constructor(name: string) {
        this.name = name;
    }

    toString() {
        return "Expression '" + this.name + "'";
    }

    text(): string {
        return this.name;
    }
}

export class ModelContext {
    @observable root: Expression;
}

export class BinExpression extends Expression {
    @observablepart left: Expression | null;

    @observablepart right: Expression | null;

    constructor(name: string) {
        super(name);
    }

    toString(): string {
        return "BinExpression";
    }
}

export class FunctionCallExpression extends Expression {
    @observablelistpart args: (Expression | null)[];

    constructor(name: string) {
        super(name);
    }

    toString(): string {
        return "FunctionCallExpression";
    }
}

export function printExp(exp: Expression | null, indent: string) {
    if (exp instanceof BinExpression) {
        console.log(indent + (exp as BinExpression).name);
        printExp(exp.left, indent + "    ");
        printExp(exp.right, indent + "    ");
    } else if (exp instanceof FunctionCallExpression) {
        console.log("Funcvtion call " + exp.name);
        exp.args.forEach(s => {
            printExp(s, indent + " s  ");
        });
    } else if (exp instanceof Expression) {
        const cont = exp.container as Expression;
        console.log(
            indent +
                exp.name +
                " => " +
                (cont ? cont.name : "null") +
                " : " +
                exp.propertyName +
                "[" +
                exp.propertyIndex +
                "]"
        );
    }
}
