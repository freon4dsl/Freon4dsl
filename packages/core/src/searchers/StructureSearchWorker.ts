import { FreNode } from "../ast";
import { FreSearchWorker } from "./FreSearchWorker";

export class StructureSearchWorker implements FreSearchWorker {
    private readonly toFind: Partial<FreNode>;
    private readonly metatype: string;
    private __result: FreNode[] = [];

    constructor(toFind: Partial<FreNode>, metatype: string) {
        this.toFind = toFind;
        this.metatype = metatype;
    }

    get result(): FreNode[] {
        return this.__result;
    }

    execAfter(modelelement: FreNode): boolean {
        // unused
        return false;
    }

    execBefore(modelelement: FreNode): boolean {
        if (!!this.metatype) {
            if (this.metatype === modelelement.freLanguageConcept() || this.metatype === "FreNodeReference") {
                if (modelelement.match(this.toFind)) {
                    this.__result.push(modelelement);
                }
            }
        } else {
            if (modelelement.match(this.toFind)) {
                this.__result.push(modelelement);
            }
        }
        return true; // is irrelevant, there are no other workers in this search
    }

}
