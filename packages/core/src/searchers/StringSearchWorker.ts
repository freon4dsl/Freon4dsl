import { FreNode } from "../ast";
import { FreWriter } from "../writer";
import { FreSearchWorker } from "./FreSearchWorker";

export class StringSearchWorker implements FreSearchWorker {
    private readonly toFind: string;
    private readonly writer: FreWriter;
    private readonly metatype: string;
    private __result: FreNode[] = [];
    private elementMap: Map<FreNode, number> = new Map<FreNode, number>();

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

    constructor(toFind: string, writer: FreWriter, metatype?: string) {
        this.toFind = toFind;
        this.writer = writer;
        this.metatype = metatype;
    }

    get result(): FreNode[] {
        if (!this.metatype || this.metatype.length <= 0) {
            this.elementMap.forEach((value, key) => {
                if (value > 0) {
                    this.__result.push(key);
                }
            });
        }
        return this.__result;
    }

    execAfter(modelelement: FreNode): boolean {
        // unused
        return false;
    }

    execBefore(modelelement: FreNode): boolean {
        if (!!this.writer) {
            if (!!this.metatype && this.metatype.length > 0) {
                if (this.metatype === modelelement.freLanguageConcept() || this.metatype === "FreNodeReference") {
                    if (this.writer.writeToString(modelelement).includes(this.toFind)) {
                        this.__result.push(modelelement);
                    }
                }
            } else {
                const stringRepresentation: string = this.writer.writeToString(modelelement);
                let count: number = StringSearchWorker.countSubsInText(stringRepresentation, this.toFind);
                this.elementMap.set(modelelement, count);
                const owner: FreNode = modelelement.freOwner();
                if (this.elementMap.has(owner)) {
                    this.elementMap.set(owner, this.elementMap.get(owner) - count);
                }
            }
        }
        return true; // is irrelevant, there are no other workers in this search
    }

    includeNode(modelelement: FreNode): boolean {
        if (!this.metatype || this.metatype.length <= 0) {
            const owner: FreNode = modelelement.freOwner();
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
