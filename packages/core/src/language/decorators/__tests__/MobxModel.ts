import "reflect-metadata";
import { PiElementReferenceM } from "./PiElementReferenceM";
import { observablelistpart, observablelistreference, observablepart, observablereference } from "../MobxModelDecorators";
import { MobxModelElementImpl } from "../DecoratedModelElement";
import { makeObservable, observable } from "mobx";

export class MobxTestElement extends MobxModelElementImpl {
    public name: string;

    constructor(name: string) {
        super();
        this.name = name;
        makeObservable(this, {
            name: observable
        })
    }

    toString() {
        return "MobxTestElement '" + this.name + "'";
    }

    text(): string {
        return this.name;
    }
}

export class ModelContext {
    root: MobxTestElement;

    constructor() {
        this.root = null;
        makeObservable(this, {
            root: observable
        })
    }
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

export class MobxTestRoot extends MobxTestElement {
    @observablepart element: MobxTestParts;
}

export class MobxTestReferences extends MobxTestElement {
    name: string;

    @observablelistreference manyReference: MobxTestElement[];
    @observablereference singleReference: MobxTestElement[];

    constructor(name: string) {
        super(name);
        makeObservable(this, {
            name: observable
        })
    }
}
