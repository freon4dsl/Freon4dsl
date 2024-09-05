import { MobxTestRoot } from "./MobxModel";
import { FreNamedNode } from "../../ast";

export class TestScoper {
    private static instance: TestScoper = new TestScoper();

    public static getInstance(): TestScoper {
        return this.instance;
    }

    root: MobxTestRoot;

    getFromVisibleElements(name: string): FreNamedNode {
        // console.log("Scoper get ["+ name + "] element [" + this.root.element.name + "] length [" + this.root.element.manyPart.length + "]" );
        // console.log("parts "+ this.root.element.manyPart.map(p => p.name) + "  found => "+ result);
        return this.root.element.manyPart.find((part) => part.name === name);
    }
}
