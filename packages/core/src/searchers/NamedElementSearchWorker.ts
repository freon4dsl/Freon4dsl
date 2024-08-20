import { FreNode } from "../ast";
import { FreSearchWorker } from "./FreSearchWorker";

export class NamedElementSearchWorker implements FreSearchWorker {
    private readonly nameToFind: string;
    private readonly metatype: string | undefined;
    private readonly caseSensitive: boolean;
    private $result: FreNode[] = [];

    constructor(nameToFind: string, caseSensitive: boolean, metatype?: string) {
        this.nameToFind = nameToFind;
        this.caseSensitive = caseSensitive;
        this.metatype = metatype;
    }

    get result(): FreNode[] {
        return this.$result;
    }

    // @ts-ignore
    // parameter is present to adhere to signature of super class
    execAfter(modelelement: FreNode): boolean {
        // unused
        return false;
    }

    execBefore(node: FreNode): boolean {
        if (!!this.metatype) {
            if (this.metatype === node.freLanguageConcept() || this.metatype === "FreNodeReference") {
                this.checkElement(node);
            }
        } else {
            this.checkElement(node);
        }
        return true; // is irrelevant, there are no other workers in this search
    }

    private checkElement(node: FreNode) {
        const valueOfNameProp = node["name"];
        if (
            valueOfNameProp !== null &&
            valueOfNameProp !== undefined &&
            typeof valueOfNameProp === "string" &&
            valueOfNameProp.length > 0
        ) {
            if (!this.caseSensitive) {
                if (valueOfNameProp.toLowerCase().includes(this.nameToFind.toLowerCase())) {
                    this.result.push(node);
                }
            } else {
                if (valueOfNameProp.includes(this.nameToFind)) {
                    this.result.push(node);
                }
            }
        }
    }
}
