import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaProperty } from "../../../../languagedef/metalanguage/index.js";
import { makeIndent, refRuleName } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSRefOptionalEntry extends RHSPropEntry {
    constructor(prop: FreMetaProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(): string {
        return `${ParserGenUtil.internalName(this.property.name)}:${refRuleName}?` + this.doNewline();
    }

    //  @ts-ignore
    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `// RHSRefOptionalEntry
            ${this.property.name}: ${ParserGenUtil.internalName(this.property.name)}`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSRefEntry: " + this.property.name;
    }
}
