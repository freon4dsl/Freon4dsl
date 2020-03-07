import "reflect-metadata";
import { listpart, ModelElement, part } from "../ModelDecorators";
import { observable } from "mobx";
import { DecoratedModelElement } from "../DecoratedModelElement";

export class ModelContext {
    @observable root: Expression;
}

export class Expression implements ModelElement {
    container: ModelElement;
    propertyName: string;
    propertyIndex: number;
    public name: string;

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

export class BinExpression extends Expression {
    @part left: Expression | null;

    @part right: Expression | null;

    @listpart somes: (Expression | null)[];

    constructor(name: string) {
        super(name);
    }
}

export function printExp(exp: Expression | null, indent: string) {
    if (exp instanceof BinExpression) {
        console.log(indent + (exp as BinExpression).name);
        printExp(exp.left, indent + "    ");
        printExp(exp.right, indent + "    ");
        exp.somes.forEach(s => {
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
