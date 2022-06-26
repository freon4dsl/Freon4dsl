import { PiElement } from "../ast";
import { SearchWorker } from "./SearchWorker";

export class NamedElementSearchWorker implements SearchWorker {
    private readonly nameToFind: string;
    private readonly metatype: string;
    private readonly caseSensitive: boolean;
    private __result: PiElement[] = [];

    constructor(nameToFind: string, caseSensitive: boolean, metatype?: string) {
        this.nameToFind = nameToFind;
        this.caseSensitive = caseSensitive;
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
                this.checkElement(modelelement);
            }
        } else {
            this.checkElement(modelelement);
        }
        return true; // is irrelevant, there are no other workers in this search
    }

    private checkElement(modelelement: PiElement) {
        let valueOfNameProp = modelelement["name"];
        if (valueOfNameProp !== null && valueOfNameProp !== undefined && typeof valueOfNameProp === "string" && valueOfNameProp.length > 0) {
            if (!this.caseSensitive) {
                if (valueOfNameProp.toLowerCase().includes(this.nameToFind.toLowerCase())) {
                    this.result.push(modelelement);
                }
            } else {
                if (valueOfNameProp.includes(this.nameToFind)) {
                    this.result.push(modelelement);
                }
            }
        }
    }
}
