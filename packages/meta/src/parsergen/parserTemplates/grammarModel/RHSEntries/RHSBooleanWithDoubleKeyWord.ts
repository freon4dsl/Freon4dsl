import { RHSPropEntry } from "./RHSPropEntry";
import { FreMetaPrimitiveProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";
import { ParserGenUtil } from "../../ParserGenUtil";

export class RHSBooleanWithDoubleKeyWord extends RHSPropEntry {
    private readonly trueKeyword: string = "";
    private readonly falseKeyword: string = "";

    constructor(prop: FreMetaPrimitiveProperty, trueKeyword: string, falseKeyword: string) {
        super(prop);
        this.trueKeyword = trueKeyword;
        this.falseKeyword = falseKeyword;
        this.isList = false;
    }

    toGrammar(): string {
        return `( '${this.trueKeyword}' | '${this.falseKeyword}' )` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        return `// RHSBooleanWithDoubleKeyWord
                if (${nodeName}[${index}].nonSkipMatchedText === "${this.trueKeyword}") {
                    ${ParserGenUtil.internalName(this.property.name)} = true;
                } else if (${nodeName}[${index}].nonSkipMatchedText === "${this.falseKeyword}") {
                    ${ParserGenUtil.internalName(this.property.name)} = false;
                }`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBooleanWithKeyWord: " + this.property.name + ": " + this.trueKeyword;
    }
}
