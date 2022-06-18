import "reflect-metadata";
import { PiElementReference, PiElementBaseImpl, observablelistpart, observablepart } from "../ast";
import { makeObservable, observable } from "mobx";
import { PiElementReferenceTestScoper } from "./PiElementReferenceTestScoper";

/**
 * These classes are used only to test the mobx decorators. They extend PiElementBase directly.
 */
export class MobxTestElement extends PiElementBaseImpl {
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

    piLanguageConcept(): string {
        return "MobxTestElement";
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

    @observablelistpart manyReference: MobxTestElement[];
    @observablepart singleReference: PiElementReferenceTestScoper<MobxTestElement>;

    constructor(name: string) {
        super(name);
    }

    piLanguageConcept(): string {
        return "MobxTestParts";
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

    @observablelistpart manyReference: MobxTestElement[];
    @observablepart singleReference: MobxTestElement[];

    constructor(name: string) {
        super(name);
        makeObservable(this, {
            name: observable
        })
    }
}
