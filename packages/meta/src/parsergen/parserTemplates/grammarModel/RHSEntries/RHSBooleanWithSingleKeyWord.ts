import { RHSPropEntry } from "./RHSPropEntry";
import { PiPrimitiveProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";
import { ParserGenUtil } from "../../ParserGenUtil";

export class RHSBooleanWithSingleKeyWord extends RHSPropEntry {
    private keyword: string = "";

    constructor(prop: PiPrimitiveProperty, keyword: string) {
        super(prop);
        this.keyword = keyword;
        this.isList = false;
    }

    toGrammar(): string {
        return `'${this.keyword}'?` + this.doNewline();
    }

    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `// RHSBooleanWithSingleKeyWord
                if (!${nodeName}[${index}].isEmptyMatch) {
                    ${ParserGenUtil.internalName(this.property.name)} = true;
                }`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth);
        return indent + "RHSBooleanWithKeyWord: " + this.property.name + ": " + this.keyword;
    }
}
