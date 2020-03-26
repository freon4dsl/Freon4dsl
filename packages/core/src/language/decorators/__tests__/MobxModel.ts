import "reflect-metadata";
import { PiElementReferenceM } from "./PiElementReferenceM";
import { observablelistpart, observablelistreference, observablepart, observablereference } from "../MobxModelDecorators";
import { DecoratedModelElement } from "../DecoratedModelElement";
import { observable } from "mobx";

export class MobxTestElement implements DecoratedModelElement {
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

export class MobxTestRoot extends MobxTestElement {
    @observablepart element: MobxTestParts
}

export class ModelContext {
    @observable root: MobxTestElement;
}

export class MobxTestTreeNode extends MobxTestElement {
    @observablepart left: MobxTestElement | null;
    @observablepart right: MobxTestElement | null;

    constructor(name: string) {
        super(name);
    }

    toString(): string {
        return "TreeNode";
    }
}

export class MobxTestParts extends MobxTestElement {
    @observablelistpart manyPart: MobxTestElement[];
    @observablepart singlePart: MobxTestElement;

    @observablelistreference manyReference: MobxTestElement[];
    @observablepart singleReference: PiElementReferenceM<MobxTestElement>;

    constructor(name: string) {
        super(name);
    }

    toString(): string {
        return "FunctionCallExpression";
    }
}

export class MobxTestReferences extends MobxTestElement {
    @observable name: string;

    @observablelistreference manyReference: MobxTestElement[];
    @observablereference singleReference: MobxTestElement[];

    constructor(name: string) {
        super(name);
    }
}

// export function printExp(exp: MobxTestElement | null, indent: string) {
//     if (exp instanceof BinExpression) {
//         console.log(indent + (exp as BinExpression).name);
//         printExp(exp.left, indent + "    ");
//         printExp(exp.right, indent + "    ");
//     } else if (exp instanceof FunctionCallExpression) {
//         console.log("Funcvtion call " + exp.name);
//         exp.args.forEach(s => {
//             printExp(s, indent + " s  ");
//         });
//     } else if (exp instanceof MobxTestElement) {
//         const cont = exp.container as MobxTestElement;
//         console.log(
//             indent +
//                 exp.name +
//                 " => " +
//                 (cont ? cont.name : "null") +
//                 " : " +
//                 exp.propertyName +
//                 "[" +
//                 exp.propertyIndex +
//                 "]"
//         );
//     }
// }
