import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaPrimitiveProperty } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSBooleanWithSingleKeyWord extends RHSPropEntry {
    private readonly keyword: string = "";

    constructor(prop: FreMetaPrimitiveProperty, keyword: string) {
        super(prop);
        this.keyword = keyword;
        this.isList = false;
    }

    toGrammar(): string {
        return `'${this.keyword}'?` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        return `// RHSBooleanWithSingleKeyWord
                if (!${nodeName}[${index}].isEmptyMatch) {
                    ${ParserGenUtil.internalName(this.property.name)} = true;
                }`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBooleanWithKeyWord: " + this.property.name + ": " + this.keyword;
    }
}
