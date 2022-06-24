import "reflect-metadata";
import { PiElementBaseImpl, observablepartlist, observablepart, observableprimlist, observableprim } from "../../ast";
import { makeObservable, observable } from "mobx";
import { PiElementReferenceTestScoper } from "./PiElementReferenceTestScoper";

/**
 * These classes are used only to test the mobx decorators. They extend PiElementBaseImpl directly.
 */

export class ModelContext {
    root: MobxTestElement;

    constructor() {
        this.root = null;
        makeObservable(this, {
            root: observable
        })
    }
}

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

export class MobxTestRoot extends MobxTestElement {
    element: MobxTestParts;

    constructor(name: string) {
        super(name);
        observablepart(this, "element");
    }

    piIsUnit(): boolean {
        return true;
    }

    piIsModel(): boolean {
        return true;
    }
}

export class MobxTestParts extends MobxTestElement {
    manyPrim: number[];
    singlePrim: number;

    manyPart: MobxTestElement[];
    singlePart: MobxTestElement;

    manyReference: PiElementReferenceTestScoper<MobxTestElement>[];
    singleReference: PiElementReferenceTestScoper<MobxTestElement>;

    constructor(name: string) {
        super(name);
        observableprim(this, "singlePrim");
        observableprimlist(this, "manyPrim");
        observablepart(this, "singlePart");
        observablepartlist(this, "manyReference");
        observablepart(this, "singleReference");
        observablepartlist(this, "manyPart");
    }

    piLanguageConcept(): string {
        return "MobxTestParts";
    }
    toString(): string {
        return "FunctionCallExpression";
    }

    piIsUnit(): boolean {
        return false;
    }

    piIsModel(): boolean {
        return false;
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
        observablepartlist(this, "manyReference");
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
