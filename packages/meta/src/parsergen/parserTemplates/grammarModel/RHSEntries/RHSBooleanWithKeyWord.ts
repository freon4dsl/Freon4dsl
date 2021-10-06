import { RHSPropEntry } from "./RHSPropEntry";
import { PiPrimitiveProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";

export class RHSBooleanWithKeyWord extends RHSPropEntry {
    private keyword: string = "";

    constructor(prop: PiPrimitiveProperty, keyword) {
        super(prop);
        this.keyword = keyword;
        this.isList = false;
    }

    toGrammar(): string {
        // no need for the closing '?' because this is always within an optional group
        // e.g [?${self.primBoolean @keyword [<BOOL>]}]
        return `'${this.keyword}'` + this.doNewline();
    }

    toMethod(propIndex: number, nodeName: string): string {
        return `// RHSBooleanWithKeyWord
                if (!${nodeName}[${propIndex}].isEmptyMatch) {
                    ${this.property.name} = true;
                }`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSBooleanWithKeyWord: " + this.property.name + ": " + this.keyword;
    }
}
