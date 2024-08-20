import { FreNode } from "../ast";
import { FreSearchWorker } from "./FreSearchWorker";

export class StructureSearchWorker implements FreSearchWorker {
    private readonly toFind: Partial<FreNode>;
    private readonly metatype: string;
    private $result: FreNode[] = [];

    constructor(toFind: Partial<FreNode>, metatype: string) {
        this.toFind = toFind;
        this.metatype = metatype;
    }

    get result(): FreNode[] {
        return this.$result;
    }

    // @ts-ignore
    // parameter is present to adhere to signature of super class
    execAfter(node: FreNode): boolean {
        // unused
        return false;
    }

    execBefore(node: FreNode): boolean {
        if (!!this.metatype) {
            if (this.metatype === node.freLanguageConcept() || this.metatype === "FreNodeReference") {
                if (node.match(this.toFind)) {
                    this.$result.push(node);
                }
            }
        } else {
            if (node.match(this.toFind)) {
                this.$result.push(node);
            }
        }
        return true; // is irrelevant, there are no other workers in this search
    }
}
