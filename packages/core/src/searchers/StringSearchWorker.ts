import { PiElement } from "../ast";
import { PiWriter } from "../writer";
import { SearchWorker } from "./SearchWorker";

export class StringSearchWorker implements SearchWorker {
    private readonly toFind: string;
    private readonly writer: PiWriter;
    private readonly metatype: string;
    private __result: PiElement[] = [];
    private elementMap: Map<PiElement, number> = new Map<PiElement, number>();

    /**
     * Returns the number of non-overlapping occurences of substring in text.
     * E.g. the result of substring "aa" in "aaaa" is 2, not 4.
     * @param text
     * @param substring
     */
    public static countSubsInText(text: string, substring: string): number {
        let index = 0;
        let count = 0;
        let length = substring.length;
        while( (index = text.indexOf(substring, index)) != -1 ) {
            index += length; count++;
        }
        return count;
    }

    constructor(toFind: string, writer: PiWriter, metatype?: string) {
        this.toFind = toFind;
        this.writer = writer;
        this.metatype = metatype;
    }

    get result(): PiElement[] {
        if (!this.metatype || this.metatype.length <= 0) {
            this.elementMap.forEach((value, key) => {
                if (value > 0) {
                    this.__result.push(key);
                }
            });
        }
        return this.__result;
    }

    execAfter(modelelement: PiElement): boolean {
        // unused
        return false;
    }

    execBefore(modelelement: PiElement): boolean {
        if (!!this.writer) {
            if (!!this.metatype && this.metatype.length > 0) {
                if (this.metatype === modelelement.piLanguageConcept() || this.metatype === "PiElementReference") {
                    if (this.writer.writeToString(modelelement).includes(this.toFind)) {
                        this.__result.push(modelelement);
                    }
                }
            } else {
                const stringRepresentation: string = this.writer.writeToString(modelelement);
                let count: number = StringSearchWorker.countSubsInText(stringRepresentation, this.toFind);
                this.elementMap.set(modelelement, count);
                const owner: PiElement = modelelement.piOwner();
                if (this.elementMap.has(owner)) {
                    this.elementMap.set(owner, this.elementMap.get(owner) - count);
                }
            }
        }
        return true; // is irrelevant, there are no other workers in this search
    }

    includeNode(modelelement: PiElement): boolean {
        if (!this.metatype || this.metatype.length <= 0) {
            const owner: PiElement = modelelement.piOwner();
            if (this.elementMap.has(owner) && this.elementMap.get(owner) <= 0) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
}
