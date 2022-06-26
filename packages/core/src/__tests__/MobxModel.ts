import "reflect-metadata";
import { PiElementBaseImpl, observablelistpart, observablepart } from "../ast";
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
    left: MobxTestElement | null;
    right: MobxTestElement | null;

    constructor(name: string) {
        super(name);
        observablepart(this, "left");
        observablepart(this, "right")
    }

    toString(): string {
        return "TreeNode";
    }
}

export class MobxTestParts extends MobxTestElement {
    manyPart: MobxTestElement[];
    singlePart: MobxTestElement;

    manyReference: MobxTestElement[];
    singleReference: PiElementReferenceTestScoper<MobxTestElement>;

    constructor(name: string) {
        super(name);
        observablepart(this, "singleReference");
        observablepart(this, "singlePart");
        observablelistpart(this, "manyReference");
        observablelistpart(this, "manyPart");
    }

    piLanguageConcept(): string {
        return "MobxTestParts";
    }
    toString(): string {
        return "FunctionCallExpression";
    }
}

export class MobxTestRoot extends MobxTestElement {
    element: MobxTestParts;

    constructor(name: string) {
        super(name);
        observablepart(this, "element");
    }
}

export class MobxTestReferences extends MobxTestElement {
    name: string;

    manyReference: MobxTestElement[];
    singleReference: MobxTestElement[];

    constructor(name: string) {
        super(name);
        makeObservable(this, { name: observable });
        observablepart(this, "singleReference");
        observablelistpart(this, "manyReference");
    }
}
