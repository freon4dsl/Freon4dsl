import { PiElement } from "../ast";
import { SearchWorker } from "./SearchWorker";

export class StructureSearchWorker implements SearchWorker {
    private readonly toFind: Partial<PiElement>;
    private readonly metatype: string;
    private __result: PiElement[] = [];

    constructor(toFind: Partial<PiElement>, metatype: string) {
        this.toFind = toFind;
        this.metatype = metatype;
    }

    get result(): PiElement[] {
        return this.__result;
    }

    execAfter(modelelement: PiElement): boolean {
        // unused
        return false;
    }

    execBefore(modelelement: PiElement): boolean {
        if (!!this.metatype) {
            if (this.metatype === modelelement.piLanguageConcept() || this.metatype === "PiElementReference") {
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
