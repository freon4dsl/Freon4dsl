import { MobxTestElement, MobxTestRoot } from "./MobxModel";
import { PiNamedElement } from "../../ast";

export class TestScoper {
    root: MobxTestRoot;

    constructor() {}

    getFromVisibleElements(name: string): PiNamedElement {
        // console.log("Scoper get ["+ name + "] element [" + this.root.element.name + "] length [" + this.root.element.manyPart.length + "]" );
        const result = this.root.element.manyPart.find(part => part.name === name);
        // console.log("parts "+ this.root.element.manyPart.map(p => p.name) + "  found => "+ result);
        return result;
    }

    private static instance: TestScoper = new TestScoper();

    public static getInstance(): TestScoper {
        return this.instance;
    }
}
